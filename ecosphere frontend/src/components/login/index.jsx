import React, { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Dummy login successful!");
  };

  return (
    <div
      className="min-h-screen flex justify-end items-center bg-cover bg-center bg-no-repeat p-6"
      style={{
        backgroundImage: "url('/login-bg.png')", // your background image
      }}
    >
      {/* LOGIN CARD ON RIGHT SIDE */}
      <div className="bg-white/20 backdrop-blur-lg shadow-2xl border border-white/30 rounded-2xl p-10 w-full max-w-md mr-6 mt-28">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-white mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-white/40 bg-white/20 text-white px-4 py-2 rounded-lg 
                        placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-white/40 bg-white/20 text-white px-4 py-2 rounded-lg 
                        placeholder-white/80 focus:ring-2 focus:ring-emerald-400 outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Login
          </button>
        </form>

        <p className="text-center text-white/80 text-sm mt-4">
          Forgot Password ? Contact Admin.
        </p>
      </div>
    </div>
  );
}
