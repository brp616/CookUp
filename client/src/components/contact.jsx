import React from 'react';

const ContactUs = () => {
  const team = [
    {
      name: "Ben",
      role: "Creator + Developer",
      github: "https://https://github.com/brp616", 
      email: "benplot@mit.edu",
      tasks: "Core frontend + backend infrastructure, database schema, API integration, design, deployment"
    },
    {
      name: "Xuan",
      role: "Creator + Developer",
      github: "https://github.com/ngxuanyi17",
      email: "xuanyi17@mit.edu",
      tasks: "User functionalities, search, recommendation engine, testing"
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Contact the Team</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '10px auto' }}>
          Hello! We are Ben and Xuan, 2 avid cooks and MBA students at MIT Sloan. This platform was engineered for <strong>WebLab 2026</strong> at MIT.
          We are both builders passionate about food who wanted to make a platform for unfiltered recipe sharing and discovery between friends.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {team.map((member) => (
          <div key={member.name} style={{
            padding: '30px',
            border: '1px solid #eaeaea',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>{member.name}</h2>
            <h4 style={{ color: '#e67e22', fontWeight: 'normal', marginBottom: '15px' }}>{member.role}</h4>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '20px' }}>{member.tasks}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <a href={member.github} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
                GitHub
              </a>
              <a href={`mailto:${member.email}`} style={buttonStyle}>
                Email
              </a>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #eee', paddingPadding: '20px' }}>
        <p style={{ color: '#999', fontSize: '0.85rem' }}>
          &copy; 2026 Ben Plotnik & Xuan Yi Ng — Built with React, Node.js, FastAPI, and deployed on Render for WebLab.
        </p>
      </footer>
    </div>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '6px',
  backgroundColor: '#333',
  color: 'white',
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'background 0.2s'
};

export default ContactUs;