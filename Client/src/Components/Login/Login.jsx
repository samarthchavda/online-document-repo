import React, { useState } from 'react';
import './Login.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    fetch("http://localhost:2000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(res => {
        if (res.status) {
          toast.success("Login Successful!");

          // Store the JWT token received from backend
          localStorage.setItem("token", res.token);

          // Store user details as needed
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", res.role);
          localStorage.setItem("userEmail", res.email);
          localStorage.setItem("userName", res.name);
          setIsLoggedIn(true);

          console.log("Logged in as:", res.role);

          setTimeout(() => {
            if (res.role === "faculty") {
              navigate("/faculty");
            } else {
              navigate("/");
            }
          }, 1000);
        } else {
          toast.error(res.message);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Something went wrong. Try again.");
      });
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-card">
        <h2 className="login-title">Welcome Back to Your Document Hub</h2>
        <p className="login-subtitle">Securely log in to manage your documents.</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
