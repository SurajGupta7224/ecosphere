import React from "react";
import {
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaFacebookF,
} from "react-icons/fa";

const Footer = () => {
  const socials = [
    { title: "LinkedIn", icon: <FaLinkedinIn />, href: "https://www.linkedin.com/" },
    { title: "Instagram", icon: <FaInstagram />, href: "https://www.instagram.com/" },
    { title: "YouTube", icon: <FaYoutube />, href: "https://www.youtube.com/" },
    { title: "Facebook", icon: <FaFacebookF />, href: "https://www.facebook.com/" },
  ];

  const services = [{ label: "Solid Waste Management", href: "/services/hazardous" }];

  const company = [
    { label: "About Us", href: "/about" },
    { label: "Technology", href: "/technology" },
    { label: "Infrastructure", href: "/infrastructure" },
    { label: "Compliance", href: "/certifications" },
    { label: "Client Portal", href: "/client-portal" },
  ];

  const resources = [
    { label: "Waste Management Guide", href: "/resources/guide" },
    { label: "Compliance Checklist", href: "/resources/checklist" },
    { label: "Sustainability Reports", href: "/resources/reports" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: "Industry Insights", href: "/resources/insights" },
  ];

  const linkStyle = {
    color: "#0f172a",
    textDecoration: "none",
    display: "inline-block",
    padding: "6px 0",
    borderRadius: "8px",
    transition: "all 0.25s ease",
  };

  const linkHover = (e) => {
    e.currentTarget.style.color = "#16a34a";
    e.currentTarget.style.transform = "translateX(4px)";
  };

  const linkLeave = (e) => {
    e.currentTarget.style.color = "#0f172a";
    e.currentTarget.style.transform = "translateX(0px)";
  };

  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        padding: "56px 56px 36px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
        {/* TOP ROW */}
        <div className="footer-top">
          {/* BRAND */}
          <div style={{ maxWidth: "420px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <img
                src="/ecospare-logo.png"
                alt="EcoSphere"
                style={{
                  height: "70px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#334155",
                marginBottom: "18px",
              }}
            >
              Technology-driven waste management solutions that combine regulatory
              compliance, environmental responsibility, and transparency.
            </p>

            {/* SOCIAL ICONS */}
            <div className="footer-socials">
              {socials.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  title={item.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    color: "#0f172a",
                    textDecoration: "none",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#16a34a";
                    e.currentTarget.style.borderColor = "#16a34a";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(22,163,74,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.color = "#0f172a";
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div className="footer-links">
            {/* Services */}
            <div>
              <h4 className="footer-title">Services</h4>
              <ul className="footer-ul">
                {services.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={linkStyle}
                      onMouseEnter={linkHover}
                      onMouseLeave={linkLeave}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="footer-title">Company</h4>
              <ul className="footer-ul">
                {company.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={linkStyle}
                      onMouseEnter={linkHover}
                      onMouseLeave={linkLeave}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="footer-title">Resources</h4>
              <ul className="footer-ul">
                {resources.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={linkStyle}
                      onMouseEnter={linkHover}
                      onMouseLeave={linkLeave}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #e2e8f0", margin: "30px 0" }} />

        {/* BOTTOM ROW */}
        <div className="footer-bottom">
          <div>
            <h4 className="footer-title">Head Office</h4>
            <p className="footer-text">
              No 201, Dhammanagi Zeus Apartment, Millers Tank Bund Rd, Vasanth Nagar,
              Bangalore, Karnataka 560034
            </p>
          </div>

          <div>
            <h4 className="footer-title">Contact</h4>
            <p className="footer-text">
              <a
                href="tel:+916363865658"
                style={{ ...linkStyle, padding: 0, color: "#334155" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#16a34a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
              >
                +91 90354 89496
              </a>
              <br />
              <a
                href="mailto:info@ecospherewm.com"
                style={{ ...linkStyle, padding: 0, color: "#334155" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#16a34a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
              >
                info@ecospherewm.com
              </a>
            </p>
          </div>

          <div>
            <h4 className="footer-title">Business Hours</h4>
            <p className="footer-text">
              Mon–Sat: 8:00 AM – 8:00 PM <br />
              24/7 Emergency Support
            </p>
          </div>

          <div className="footer-logo">
            <img
              src="/mukka-logo.png"
              alt="Mukka Proteins Logo"
              style={{
                height: "60px",
                width: "auto",
                objectFit: "contain",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                padding: "8px",
                background: "#ffffff",
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #e2e8f0", margin: "22px 0 14px" }} />

        {/* COPYRIGHT ROW */}
        <div className="footer-copy">
          <p style={{ margin: 0, textAlign: "center" }}>
            Ecosphere waste solutions - a subsidiary of Mukka Proteins Limited all rights reserved - technology partner - adml technoservices private limited
          </p>

          <div className="footer-copy-links">
            <a
              href="https://hommlie.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-small-link"
            >
              Hommlie.com
            </a>
            <a href="/privacy-policy" className="footer-small-link">
              Privacy Policy
            </a>
            <a href="/refund-policy" className="footer-small-link">
              Payment Refund Policy
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Responsive CSS inside component */}
      <style>{`
        .footer-top{
          display: grid;
          grid-template-columns: 1.1fr 1.9fr;
          gap: 40px;
        }

        .footer-socials{
          display: flex;
          gap: 12px;
          flex-wrap: wrap; /* ✅ mobile wrap */
        }

        .footer-links{
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
        }

        .footer-title{
          font-size: 16px;
          font-weight: 700;
          color: #16a34a;
          margin-bottom: 10px;
        }

        .footer-ul{
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .footer-bottom{
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px;
        }

        .footer-text{
          line-height: 1.7;
          color: #334155;
          font-size: 14px;
          margin: 0;
        }

        .footer-logo{
          display: flex;
          align-items: flex-start;
        }

        .footer-copy{
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 13px;
          color: #64748b;
        }

        .footer-copy-links{
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-small-link{
          color: #64748b;
          text-decoration: underline;
          transition: color .2s ease;
        }
        .footer-small-link:hover{
          color: #16a34a;
        }

        /* ✅ TABLET */
        @media (max-width: 1024px){
          .footer-top{
            grid-template-columns: 1fr;
          }
          .footer-links{
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .footer-bottom{
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* ✅ MOBILE */
        
          @media (max-width: 640px){
            .footer-links{
              grid-template-columns: repeat(2, minmax(0, 1fr)); /* Company + Resources side-by-side */
              gap: 18px;
            }

            /* Services full width on top */
            .footer-links > div:first-child{
              grid-column: 1 / -1;
            }

            .footer-bottom{
              grid-template-columns: 1fr;
            }
            .footer-copy{
              justify-content: center;
              text-align: center;
            }
          }

      `}</style>
    </footer>
  );
};

export default Footer;
