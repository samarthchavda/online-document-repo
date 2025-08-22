import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About LearnDocs</h1>
        <p className="about-intro">
          LearnDocs is a collaborative platform designed to streamline the sharing of educational materials between students and faculty. Whether it’s uploading notes, sharing assignments, or accessing lab manuals, LearnDocs ensures everything is just a click away.
        </p>

        <div className="about-section">
          <h2>🎯 Our Mission</h2>
          <p>
            We aim to make learning and resource sharing simple, centralized, and accessible to all. By bridging the gap between faculty and students, LearnDocs encourages seamless academic collaboration.
          </p>
        </div>

        <div className="about-section">
          <h2>💡 Key Features</h2>
          <ul>
            <li>📤 Upload and categorize documents (PPTs, Assignments, Notes, Lab Manuals)</li>
            <li>📂 View and download documents from any device</li>
            <li>📩 Faculty task assignment and response submissions</li>
            <li>✅ Faculty review with approve/reject options</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>👨‍🏫 Built For</h2>
          <p>
            LearnDocs is ideal for schools, colleges, and institutions aiming to digitize and simplify their academic workflow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
