import React, { useState, useEffect } from "react";
import { customerFetch } from "../../api";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "reset"

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
    new_password: "",
    confirm_password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        if (!form.email || !form.password) {
          throw new Error("Please enter both email and password.");
        }
        const data = await customerFetch("/customer/login", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        localStorage.setItem("customer_token", data.token);
        localStorage.setItem("customer_user", JSON.stringify(data.customer));

        // Redirect to customer dashboard
        window.location.href = "/dashboard";
      }

      else if (mode === "forgot") {
        if (!form.email) {
          throw new Error("Please enter your registered email address.");
        }
        const data = await customerFetch("/customer/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: form.email }),
        });

        setSuccess(data.message || "Verification OTP sent to your email address. Please check your inbox.");
        setMode("reset");
      }
 
      else if (mode === "reset") {
        if (!form.otp || !form.new_password || !form.confirm_password) {
          throw new Error("OTP, New Password, and Confirm Password are all required.");
        }
        if (form.new_password !== form.confirm_password) {
          throw new Error("New Password and Confirm Password do not match.");
        }

        const data = await customerFetch("/customer/reset-password", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            otp: form.otp,
            new_password: form.new_password,
          }),
        });

        setSuccess(data.message || "Password reset successfully! Please login with your new password.");
        setMode("login");
        setForm(prev => ({ ...prev, password: "", otp: "", new_password: "", confirm_password: "" }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "forgot": return "Forgot Password";
      case "reset": return "Reset Password";
      default: return "Login";
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case "forgot": return "Send Verification OTP";
      case "reset": return "Reset Password";
      default: return "Login";
    }
  };

  return (
    <div
      className="min-h-screen flex justify-end items-center bg-cover bg-center bg-no-repeat p-6"
      style={{
        backgroundImage: "url('/login-bg.png')",
      }}
    >
      {/* AUTH CARD */}
      <div className="bg-white/20 backdrop-blur-lg shadow-2xl border border-white/30 rounded-2xl p-10 w-full max-w-md mr-6 mt-28">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {getTitle()}
        </h2>

        {error && (
          <div className="bg-rose-500/30 border border-rose-500/50 text-rose-100 px-4 py-2.5 rounded-lg text-sm mb-5 font-medium text-center shadow-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/30 border border-emerald-500/50 text-emerald-100 px-4 py-2.5 rounded-lg text-sm mb-5 font-medium text-center shadow-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode !== "reset" && (
            <div>
              <label className="block text-white mb-1 font-semibold text-sm">Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full border border-white/40 bg-white/20 text-white px-4 py-2.5 rounded-lg 
                          placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none disabled:opacity-50 text-sm"
                placeholder="Enter your email address"
              />
            </div>
          )}

          {mode === "login" && (
            <div>
              <label className="block text-white mb-1 font-semibold text-sm">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full border border-white/40 bg-white/20 text-white px-4 py-2.5 rounded-lg 
                          placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none disabled:opacity-50 text-sm"
                placeholder="Enter your password"
              />
            </div>
          )}

          {mode === "reset" && (
            <>
              <div>
                <label className="block text-white mb-1 font-semibold text-sm">Verification OTP *</label>
                <input
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  maxLength={4}
                  className="w-full border border-white/40 bg-white/20 text-white px-4 py-2.5 rounded-lg 
                            placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none disabled:opacity-50 text-center font-bold tracking-widest text-lg"
                  placeholder="Enter 4-digit OTP"
                />
              </div>

              <div>
                <label className="block text-white mb-1 font-semibold text-sm">New Password *</label>
                <input
                  type="password"
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full border border-white/40 bg-white/20 text-white px-4 py-2.5 rounded-lg 
                            placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none disabled:opacity-50 text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-white mb-1 font-semibold text-sm">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full border border-white/40 bg-white/20 text-white px-4 py-2.5 rounded-lg 
                            placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none disabled:opacity-50 text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
          >
            {loading ? "Please wait..." : getButtonText()}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2.5 mt-6 text-center text-sm">
          {mode === "login" && (
            <button
              onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
              className="text-white/90 hover:text-white hover:underline font-semibold transition cursor-pointer text-sm"
            >
              Forgot Password?
            </button>
          )}

          {mode === "login" && (
            <button
              type="button"
              onClick={() => window.location.href = "/waste-collection-requests"}
              className="text-white/90 hover:text-white hover:underline font-semibold transition cursor-pointer text-sm"
            >
              New User? Register
            </button>
          )}

          {(mode === "forgot" || mode === "reset") && (
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="text-white/90 hover:text-white hover:underline font-semibold transition cursor-pointer text-sm"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
