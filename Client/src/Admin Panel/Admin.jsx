import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    // Redirect if not logged in as admin
    if (isAdmin !== "true") {
      navigate("/admin/login", { replace: true });
      return;
    }

    // Fetch all users from backend
    fetch("http://localhost:2000/users/data")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        // data is expected to be an array of users
        const students = data.filter((user) => user.role === "student");
        const faculty = data.filter((user) => user.role === "faculty");
        setStudentsCount(students.length);
        setFacultyCount(faculty.length);
        setTotalUsers(data.length);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        alert("Failed to fetch user data. Make sure you are logged in as admin.");
      });

    // Prevent back navigation (optional)
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.pathname);
    };
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-container">
      <div className="admin-top-bar">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>
        <div className="admin-card">
          <h3>Students</h3>
          <p>{studentsCount}</p>
        </div>
        <div className="admin-card">
          <h3>Faculty</h3>
          <p>{facultyCount}</p>
        </div>
      </div>

      <div className="admin-buttons">
        <button onClick={() => navigate("/admin/students")}>📘 Student Data</button>
        <button onClick={() => navigate("/admin/faculty")}>🎓 Faculty Data</button>
      </div>
    </div>
  );
};

export default Admin;
