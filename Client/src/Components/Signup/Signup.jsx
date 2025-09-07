import React, { useState } from 'react';
import './Signup.css'; // ← If your file is named 'Signup.css'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setname] = useState("");
    const [email, seteamil] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpass, setconfirmpass] = useState("");

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) =>
        /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/.test(password);
    const namePattern = /^[A-Za-z\s]{3,}$/;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!namePattern.test(name.trim())) {
            toast.error("Name must be at least 3 characters and contain only letters");
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email");
            return;
        }

        if (!validatePassword(password)) {
            toast.error("Password must be at least 6 characters, include 1 number & 1 special character");
            return;
        }

        if (password !== confirmpass) {
            toast.error("Passwords do not match");
            return;
        }

        // **Frontend only allows student signup**
        fetch("http://localhost:2000/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role: "student" }) // role auto student
        })
            .then(res => res.json())
            .then(res => {
                if (res.status) {
                    toast.success("Signup successful. Please login.");
                    setTimeout(() => {
                        navigate("/login");
                    }, 1000);
                } else {
                    toast.error(res.message);
                }
            })
            .catch(() => {
                toast.error("Server error");
            });
    };

    return (
        <div className="signup-container">
            <ToastContainer />
            <div className="signup-card">
                <h2 className="signup-title">Create Your Account</h2>
                <p className="signup-subtitle">Register as a student to start using the platform.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="signup-input"
                        value={name}
                        onChange={(e) => {
                            const value = e.target.value;
                            const onlyLetters = /^[A-Za-z\s]*$/;
                            if (onlyLetters.test(value)) {
                                setname(value);
                            }
                        }}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="signup-input"
                        value={email}
                        onChange={(e) => seteamil(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="signup-input"
                        value={password}
                        onChange={(e) => setpassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="signup-input"
                        value={confirmpass}
                        onChange={(e) => setconfirmpass(e.target.value)}
                        required
                    />

                    <button type="submit" className="signup-btn">Sign Up</button>
                </form>

                <div className="signup-footer">
                    <p>Already have an account? <a href="/login">Login here</a></p>
                    <p>If you want to signup as faculty, <a href="/facultysignup">click here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
