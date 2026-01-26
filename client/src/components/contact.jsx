import React from 'react';
import '../styles/ContactUs.css'; 
//info on the team
const team = [
  {
    name: "Ben",
    role: "Creator + Developer",
    github: "https://github.com/brp616", 
    email: "benplot@mit.edu",
    bio: "Focused on the heavy lifting: core infrastructure, database architecture, and making sure the API actually talks to the frontend."
  },
  {
    name: "Xuan",
    role: "Creator + Developer",
    github: "https://github.com/ngxuanyi17",
    email: "xuanyi17@mit.edu",
    bio: "The brain behind user experience, search functionality, and our recommendation engine. If the app feels smart, that's Xuan."
  }
];

const ContactUs = () => {
  return (
    <main className="contact-wrapper">
      <header className="contact-header">
        <h1>Meet the Team 🥗</h1>
        <p>We’re Ben and Xuan, two avid cooks and MBA students at MIT Sloan. 
          We built <strong>CookUp</strong> for WebLab 2026 because we wanted a 
          space for friends to share real, unfiltered recipes.</p>
          <p>See our repository <a href="https://github.com/brp616/CookUp/tree/final_weblab_branch" target="_blank" rel="noreferrer">here</a> to look under the hood at the project. Check our readme for full citations and attributions.</p>
      </header>

      <section className="team-grid">
        {team.map(({ name, role, github, email, bio }) => (
          <div key={name} className="member-card">
            <h2>{name}</h2>
            <span className="member-role">{role}</span>
            <p className="member-bio">{bio}</p>
            <div className="button-group">
              <a href={github} target="_blank" rel="noreferrer" className="btn secondary"> GitHub</a>
              <a href={`mailto:${email}?subject=CookUp Feedback`} className="btn primary">Get in Touch</a>
            </div>
          </div>))}
      </section>
      <footer className="contact-footer">
        <p>
          &copy; 2026 Ben Plotnik & Xuan Yi Ng <br />
          Built with the React and Node.js + FastAPI on MongoDB. Images hosted by Cloudinary. Deployed on Render.
        </p>
      </footer></main>
  );
};

export default ContactUs;