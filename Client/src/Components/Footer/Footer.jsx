import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-left">
          <h3>LearnDocs</h3>
          <p>Empowering students and faculty to share and learn better through digital documentation.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/upload">Upload</a></li>
            <li><a href="/view">View</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:learndocs@email.com">learndocs@email.com</a></p>
          <p>Phone: +91-9876543210</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LearnDocs. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
