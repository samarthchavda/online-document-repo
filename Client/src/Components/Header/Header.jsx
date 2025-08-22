import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'
import logo from '../Images/logo-head.png'

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  setIsLoggedIn(false);
  navigate("/");
};

  return (
    <div>
      <div className="header-container">
        <div className="header-components">
          <div className="left-header">
            <img src={logo} alt="logo" />
            <h2>LearnDocs</h2>
          </div>
          <nav className='nav-links'>
            <Link to="/">Home</Link>
            <Link to="/upload">Upload document</Link>
            <Link to="/view">View Document</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <nav className='auth-btn'>
            {!isLoggedIn ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            ) : (
              <button className='logout-btn' onClick={handleLogout}>Logout</button>
            )}

          </nav>
        </div>
      </div>
    </div>
  )
}

export default Header
