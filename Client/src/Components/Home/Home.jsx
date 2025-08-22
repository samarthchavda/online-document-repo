import React from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handlegetstart = () =>{
     const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/upload");
    } else {
      navigate("/login");
    }
  }
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Access Your Documents Anytime, Anywhere</h1>
          <p>
            A secure and efficient platform to store, organize, and manage your documents online.
          </p>
          <div className="cta-buttons">
            {/* <form action=""> */}
              <button className="primary-btn" onClick={handlegetstart}>Get Started</button>
            {/* </form> */}
          </div>
        </div>

      </section>

      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <Link to="/upload" style={{ textDecoration: "none" }}>
            <div className="feature-card">
              📁 <h3>Upload & Organize</h3>
              <p>Upload files and categorize them for easy access.</p>
            </div>
          </Link>
            <div className="feature-card">
          <Link to="/view" style={{ textDecoration: "none", color:"black" }}>
              🔍 <h3>Smart Search</h3>
              <p>Find documents quickly with powerful filtering.</p>
          </Link>
            </div>
          <div className="feature-card">
            🔐 <h3>Secure Access</h3>
            <p>Your data is protected with end-to-end encryption.</p>
          </div>
          <div className="feature-card">
            📤 <h3>Easy Sharing</h3>
            <p>Share your documents via secure links in seconds.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
