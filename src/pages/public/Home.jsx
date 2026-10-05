
import React from 'react';

const Home = () => {
  // Define the la Palette as a JS object for consistency
  const colors = {
    bgPrimary: '#090A0C',
    bgSecondary: '#121417',
    bgSurface: '#1C2025',
    border: '#343A40',
    accentRed: '#E50914',
    accentNeon: '#FF1A1A',
    textPrimary: '#F5F7F8',
    textSecondary: '#B8BEC5',
    textMuted: '#737A82',
  };

  return (
    <div style={{ 
      backgroundColor: colors.bgPrimary, 
      color: colors.textPrimary, 
      minHeight: '100vh', 
      fontFamily: 'Inter, sans-serif',
      margin: 0,
      padding: 0 
    }}>
      {/* Hero Section */}
      <section style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
        backgroundImage: 'radial-gradient(circle at center, #1c2025 0%, #090a0c 100%)',
        textAlign: 'center',
        padding: '0 20px',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            fontWeight: '900', 
            color: colors.textPrimary,
            lineHeight: '1',
            marginBottom: '20px',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            letterSpacing: '-2px'
          }}>
            BEYOND <span style={{ color: colors.accentRed }}>LIMITS</span>
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: colors.textSecondary, 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            letterSpacing: '1px',
            lineHeight: '1.6'
          }}>
            Experience the pinnacle of automotive engineering. A curated collection of the world's most exclusive hypercars.
          </p>
          <button style={{ 
            backgroundColor: colors.accentRed, 
            color: 'white', 
            padding: '15px 35px', 
            borderRadius: '4px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '1rem',
            boxShadow: '0 0 15px rgba(229, 9, 20, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = colors.accentNeon}
          onMouseOut={(e) => e.target.style.backgroundColor = colors.accentRed}
          >
            Explore Fleet
          </button>
        </div>

        {/* Glow Effect */}
        <div style={{ 
          position: 'absolute', 
          width: '50vw', 
          height: '50vw', 
          background: 'radial-gradient(circle, rgba(229,9,20,0.1) 0%, rgba(0,0,0,0) 70%)',
          top: '10%', 
          right: '-10%', 
          zIndex: 1,
          pointerEvents: 'none'
        }}></div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '30px', 
        padding: '100px 10%',
        backgroundColor: colors.bgSecondary
      }}>
        {[
          { val: '50+', label: 'Exclusive Cars' },
          { val: '100%', label: 'Verified History' },
          { val: '24/7', label: 'Concierge Service' },
        ].map((stat, i) => (
          <div key={i} style={{ 
            backgroundColor: colors.bgSurface, 
            border: `1px solid ${colors.border}`, 
            borderRadius: '15px', 
            padding: '50px 20px', 
            textAlign: 'center',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = colors.accentRed}
          onMouseOut={(e) => e.currentTarget.style.borderColor = colors.border}
          >
            <h3 style={{ color: colors.accentRed, fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '800' }}>{stat.val}</h3>
            <p style={{ color: colors.textMuted, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
