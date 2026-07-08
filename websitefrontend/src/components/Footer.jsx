import { Leaf, MessageSquare, ShieldAlert } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <a href="#" className="nav-brand" style={{ marginBottom: '1rem' }}>
              <span className="nav-brand-icon">
                <Leaf size={24} strokeWidth={2.5} fill="currentColor" fillOpacity={0.2} />
              </span>
              <span>Ecosphere</span>
            </a>
            <p style={{ maxWidth: '320px' }}>
              Empowering communities to transition to a circular economy. Manage waste, track recycling metrics, and visualize ecological impact through clean, interactive technology.
            </p>
            <div className="social-icons" style={{ marginTop: '1rem' }}>
              <a href="#" className="social-icon-btn" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Discord">
                <MessageSquare size={18} />
              </a>
              <a href="#" className="social-icon-btn" aria-label="Security">
                <ShieldAlert size={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><a href="#">Overview</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#calculator">Impact Calculator</a></li>
              <li><a href="http://localhost:5173/login">Portal Login</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Sustainability Guides</a></li>
              <li><a href="#">Community Forum</a></li>
              <li><a href="#">API Reference</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Stay Connected</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Subscribe to our circular economy newsletters for insights and product updates.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="email" 
                className="input-control" 
                placeholder="Enter your email" 
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', flex: 1 }}
              />
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Ecosphere Platform. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ transition: 'color 0.2s' }}>Privacy Policy</a>
            <a href="#" style={{ transition: 'color 0.2s' }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
