import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </div>
        <div className="social-icons">
          <span className="social-icon">📘</span>
          <span className="social-icon">🐦</span>
          <span className="social-icon">📷</span>
          <span className="social-icon">💼</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
