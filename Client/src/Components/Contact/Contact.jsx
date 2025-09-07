import React, { useState } from 'react';
import './Contact.css';
import contactImage from '../images/Contact.jpeg'; // if file is 'Contact.jpeg'
import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = () => {
    const navigate = useNavigate();
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [message, setmessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handlesubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        fetch("http://localhost:2000/users/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
        })
            .then(rawdata => rawdata.json())
            .then(res => {
                if (res.status) {
                    toast.success("Thank you for contacting us! We'll reply within 24 hours.");
                    setname('');
                    setemail('');
                    setmessage('');
                    setTimeout(() => {
                        navigate("/");
                    }, 1500);
                } else {
                    toast.error("Something went wrong. Please try again later.");
                }
            })
            .catch(() => {
                toast.error("Server error. Please check your connection.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="contact-container">
            <ToastContainer />
            <div className="contact-content">
                <div className="contact-left">
                    <img src={contactImage} alt="Contact" className="contact-img" />
                    <a href="https://www.marwadiuniversity.ac.in/" target="_blank" rel="noreferrer">
                        <p className="contact-para">Marwadi University,</p>
                        <p className="contact-para">Morbi Road,</p>
                        <p className="contact-para">Rajkot.</p>
                    </a>
                    <p className="contact-mail">
                        <IoMdMail color="black" /> learndocs@email.com
                    </p>
                    <div className="social-icons">
                        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"><FaInstagram size={30} color="black" /></a>
                        <a href="https://github.com/samarthchavda" target="_blank" rel="noreferrer"><FaGithub size={30} color="black" /></a>
                        <a href="https://www.linkedin.com/in/samarth-chavda-0b938526a" target="_blank" rel="noreferrer"><FaLinkedin size={30} color="black" /></a>
                    </div>
                </div>
                <div className="contact-right">
                    <form onSubmit={handlesubmit}>
                        <div className="contact-form">
                            <h2 className="contact-head">Contact With Us</h2>
                            <input
                                type="text"
                                placeholder="Enter Your Name"
                                className="contact-input"
                                value={name}
                                onChange={(e) => setname(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Enter Your Email"
                                className="contact-input"
                                value={email}
                                onChange={(e) => setemail(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Your Message"
                                className="contact-msg"
                                value={message}
                                onChange={(e) => setmessage(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading} className="contact-btn">
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
