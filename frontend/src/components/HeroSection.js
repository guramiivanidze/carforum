import React from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className="hero-section">
      <h1>Welcome to the Forum!</h1>
      <p>Join discussions, ask questions, and share knowledge.</p>
      <Link to="/create-topic" className="create-post-btn">+ Create New Topic</Link>
    </div>
  );
}

export default HeroSection;
