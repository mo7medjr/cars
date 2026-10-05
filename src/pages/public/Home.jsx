// Vercel Force Build Trigger v3

import React from 'react';
import "../../styles/cinematic.css";

const Home = () => {
  return (
    <div className="home-container" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="hero" style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        backgroundImage: 'radial-gradient(circle at center, #1c2025 0%, #090a0c 100%)',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <div className="hero-content" style={{ zIndex: 2 }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            fontWeight: '900', 
            color: 'var(--text-primary)',
            lineHeight: '1',
            marginBottom: '20px',
            textTransform: 'uppercase',
            fontStyle: 'italic'
          }}>
            BEYOND <span style={{ color: 'var(--accent-red)' }}>LIMITS</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            letterSpacing: '1px'
          }}>
            Experience the pinnacle of automotive engineering. A curated collection of the world's most exclusive hypercars.
          </p>
          <div className="hero-btns">
            <button className="btn-racing">Explore Fleet</button>
          </div>
        </div>

        {/* Background Accent - Red Glow */}
        <div style={{ 
          position: 'absolute', 
          width: '40vw', 
          height: '40vw', 
          background: 'radial-gradient(circle, rgba(229,9,20,0.15) 0%, rgba(0,0,0,0) 70%)',
          top: '10%', 
          right: '-10%', 
          zIndex: 1 
        }}></div>
      </section>

      {/* Quick Stats Section */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        padding: '80px 10%',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div className="luxury-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-red)', fontSize: '2.5rem', margin: '0' }}>50+</h3>
          <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Exclusive Cars</p>
        </div>
        <div className="luxury-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-red)', fontSize: '2.5rem', margin: '0' }}>100%</h3>
          <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Verified History</p>
        </div>
        <div className="luxury-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent-red)', fontSize: '2.5rem', margin: '0' }}>24/7</h3>
          <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.9rem' }}>Concierge Service</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
