import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();

    // Hardcoded admin credentials check
    if (adminId === "92200103165" && adminPassword === "samarth") {
      localStorage.setItem("isAdmin", "true");
      toast.success("Admin login successful!");
      setTimeout(() => {
        navigate("/adminpanel");
      }, 1000);
    } else {
      toast.error("Invalid ID or Password");
    }
  };

  return (
    <div className="admin-login-container">
      <ToastContainer />
      <form onSubmit={handleAdminLogin} className="admin-login-form">
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
