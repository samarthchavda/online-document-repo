import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FacultySignup.css";

const FacultySignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [facultyId, setFacultyId] = useState(null);

  const navigate = useNavigate(); // <-- useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPass || !facultyId) {
      toast.error("All fields are required");
      return;
    }
    if (password !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPass);
    formData.append("facultyIdPhoto", facultyId);

    try {
      const res = await fetch("http://localhost:2000/faculty/signup-request", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status) {
        toast.success(data.message);

        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPass("");
        setFacultyId(null);

        // Redirect to home page after short delay
        setTimeout(() => {
          navigate("/");
        }, 1500); // 1.5 seconds delay to allow toast to show
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  return (
    <div id="faculty-signup-container">
      <ToastContainer />
      <div id="faculty-signup-card">
        <h2>Faculty Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="faculty-name"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            id="faculty-email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            id="faculty-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            id="faculty-confirm-password"
            placeholder="Confirm Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
          />
          <input
            type="file"
            id="faculty-id-photo"
            accept="image/*"
            onChange={(e) => setFacultyId(e.target.files[0])}
            required
          />
          <button type="submit" id="faculty-submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultySignup;
