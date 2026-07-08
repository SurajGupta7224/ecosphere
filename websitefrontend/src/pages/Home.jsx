import { useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  TreePine, 
  Scale 
} from 'lucide-react';

function Home() {
  // Live Calculator State
  const [wasteAmount, setWasteAmount] = useState(120); // in kg
  const [recycleRate, setRecycleRate] = useState(45); // in %

  // Calculations
  const co2Saved = Math.round(wasteAmount * (recycleRate / 100) * 1.45);
  const landfillDiverted = Math.round(wasteAmount * (recycleRate / 100));

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid animate-fade-in">
            <div className="hero-content">
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'var(--primary-glow)', 
                  border: '1px solid hsla(var(--hue-primary), 72%, 45%, 0.2)', 
                  padding: '0.4rem 1rem', 
                  borderRadius: 'var(--radius-full)', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  marginBottom: '1.5rem'
                }}
              >
                <Sparkles size={14} /> Reimagining Waste Management Systems
              </div>
              <h1>
                Smart Sustainability for a <span className="text-gradient">Circular Economy</span>
              </h1>
              <p>
                Ecosphere bridges the gap between environmental monitoring, municipal zone mapping, and dynamic waste dispatching. Empowering smart cities and corporate systems to track, audit, and reduce ecological footprints.
              </p>
              <div className="hero-cta">
                <a href="http://localhost:5173/login" className="btn btn-primary">
                  Get Started <ArrowRight size={18} />
                </a>
                <a href="#features" className="btn btn-secondary">
                  Explore Features
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-glow"></div>
              <img 
                src="/ecosphere_hero.png" 
                alt="Ecosphere Biosphere Illustration" 
                className="hero-image animate-float animate-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Core Advantages
            </div>
            <h2>Built for modern ecological tracking</h2>
            <p>Our unified platform offers modular tools to map, schedule, and optimize circular economy pipelines.</p>
          </div>

          <div className="features-grid">
            <div className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <MapPin size={24} />
              </div>
              <h3>Geographic Zone Mapping</h3>
              <p>Allocate collection events, map municipal corporations into custom zones and wards, and manage routes intelligently.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3>Granular Role Permissions</h3>
              <p>Secure system workflows with tailored controls for city administrators, regional managers, collectors, and corporate partners.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <Layers size={24} />
              </div>
              <h3>Dynamic Category Trees</h3>
              <p>Configure nested waste hierarchies, custom rates, weight slots, and scheduling rules tailored to local processing plants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Calculator Section */}
      <section id="calculator" className="stats-section">
        <div className="container">
          <div className="section-header">
            <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Ecological Forecast
            </div>
            <h2>Calculate your potential impact</h2>
            <p>See how optimizing circular recycling rates inside a corporation or municipality saves carbon and redirects waste.</p>
          </div>

          <div className="glass-card calculator-card">
            <h3 className="calc-title">Interactive Impact Estimator</h3>
            
            <div className="calc-inputs">
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-label">Monthly Waste Generated</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{wasteAmount} kg</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  step="10"
                  value={wasteAmount} 
                  onChange={(e) => setWasteAmount(Number(e.target.value))}
                  className="slider-control" 
                />
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-label">Target Recycling/Diverting Rate</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{recycleRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={recycleRate} 
                  onChange={(e) => setRecycleRate(Number(e.target.value))}
                  className="slider-control" 
                />
              </div>
            </div>

            <div className="calc-results">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <TreePine size={32} style={{ color: 'var(--primary)', marginBottom: '0.25rem' }} />
                <div className="result-val">{co2Saved} kg</div>
                <div className="result-lbl">CO2 Emissions Saved / mo</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <Scale size={32} style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }} />
                <div className="result-val">{landfillDiverted} kg</div>
                <div className="result-lbl">Diverted from Landfills / mo</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              * Estimates calculated based on EPA Waste Reduction Model (WARM) averages.
            </div>
          </div>
        </div>
      </section>

      {/* About Platform / Call to Action */}
      <section id="about" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="glass-card" style={{ padding: 'var(--space-lg) var(--space-md)', textAlign: 'center', border: '1px solid var(--primary-glow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, hsla(var(--hue-primary), 72%, 45%, 0.03) 0%, rgba(0,0,0,0) 50%)', zIndex: -1 }}></div>
            <h2 style={{ marginBottom: '1rem' }}>Ready to launch your Ecosphere workspace?</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '1.1rem' }}>
              Connect with your local administrative division, define custom roles, map wards, and manage collection requests under a unified sustainability ledger.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <a href="http://localhost:5173/login" className="btn btn-primary">
                Access Platform Portal <TrendingUp size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
