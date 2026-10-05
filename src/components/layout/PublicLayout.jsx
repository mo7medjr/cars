
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../../styles/cinematic.css';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <nav className="glass-nav">
        <div className="logo" style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '2px' }}>
          CARS<span style={{ color: 'var(--accent-red)' }}>.</span>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/fleet">Fleet</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/about">About</Link>
          <Link to="/book" className="btn-racing" style={{ marginLeft: '20px' }}>Book Now</Link>
        </div>
      </nav>
      
      <main style={{ marginTop: '60px' }}>
        <Outlet />
      </main>

      <footer style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: '60px 10% 30px', 
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>CARS</h2>
          <p style={{ maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
            The most exclusive collection of hypercars, delivered with absolute precision.
          </p>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.8rem' }}>
          © 2026 CARS. All Rights Reserved. Developed by Mohamed Reda.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
