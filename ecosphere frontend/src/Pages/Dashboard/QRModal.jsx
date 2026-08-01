import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FiX, FiDownload } from "react-icons/fi";

// -----------------------------------------------------------
// Customer QR modal — every element uses inline styles on
// purpose. This dashboard has a global stylesheet somewhere
// applying `float` to something matching the old id/classes,
// which collapsed the layout even with Tailwind overrides.
// Inline styles beat everything except !important, so this
// sidesteps the conflict entirely instead of fighting it.
// -----------------------------------------------------------
export default function QRModal({ isOpen, onClose, customer }) {
  const qrWrapperRef = useRef(null);

  if (!isOpen) return null;

  const customerId = customer?.customer_id || customer?._id || "customer";
  const customerName = customer?.customer_name || "Customer";

  const handleDownload = () => {
    // ref instead of document.querySelector("#id canvas") —
    // avoids any id-based CSS selector matching this element
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `customer-qr-${customerId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          borderRadius: "24px",
          background: "#ffffff",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "9999px",
            background: "#f3f4f6",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
            padding: 0,
          }}
        >
          <FiX size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", width: "100%", marginTop: "8px" }}>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Customer QR Code
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Show this QR code to the collection team
          </p>
        </div>

        {/* QR code */}
        <div
          ref={qrWrapperRef}
          style={{
            marginTop: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            padding: "16px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "fit-content",
          }}
        >
          <QRCodeCanvas value={customerId} size={220} level="H" includeMargin />
        </div>

        {/* Customer details */}
        <div style={{ marginTop: "20px", textAlign: "center", width: "100%" }}>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            {customerName}
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            Customer ID:{" "}
            <span style={{ fontWeight: 600, color: "#374151" }}>
              {customerId}
            </span>
          </p>
        </div>

        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          style={{
            marginTop: "24px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderRadius: "12px",
            background: "#111827",
            color: "#ffffff",
            padding: "14px",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <FiDownload size={17} />
          Download QR
        </button>
      </div>
    </div>
  );
}
