import { useState, useEffect } from 'react';
import { Leaf, Menu, X, ArrowRight } from 'lucide-react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <a href="#" className="nav-brand">
          <span className="nav-brand-icon">
            <Leaf size={28} strokeWidth={2.5} fill="currentColor" fillOpacity={0.2} />
          </span>
          <span>Ecosphere</span>
        </a>

        {/* Desktop Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <li>
            <a 
              href="#" 
              className="nav-link active" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#features" 
              className="nav-link" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
          </li>
          <li>
            <a 
              href="#calculator" 
              className="nav-link" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Impact Calculator
            </a>
          </li>
          <li>
            <a 
              href="#about" 
              className="nav-link" 
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
          </li>
          <li>
            <a 
              href="http://localhost:5173/login" 
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              Launch Portal <ArrowRight size={16} />
            </a>
          </li>
        </ul>

        {/* Mobile Toggle Menu */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
