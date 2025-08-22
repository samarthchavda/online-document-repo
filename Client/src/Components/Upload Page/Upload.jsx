import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Upload.css';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  const [assignedFiles, setAssignedFiles] = useState([]);
  const [studentResponses, setStudentResponses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const logoutAndRedirect = useCallback(() => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    alert("Please login to access this page.");
    navigate('/login');
  }, [navigate]);

  // Check login on mount
  useEffect(() => {
    if (!userEmail || !token) {
      logoutAndRedirect();
    }
  }, [userEmail, token, logoutAndRedirect]);

  // Fetch helper with 401 handling
  const fetchWithAuth = async (url) => {
    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logoutAndRedirect();
        return null;
      }
      return res.json();
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      return null;
    }
  };

  const fetchAssignedFiles = useCallback(async () => {
    const data = await fetchWithAuth(`http://localhost:2000/student/assigned-files/${userEmail}`);
    if (data) setAssignedFiles(data);
  }, [userEmail, token]);

  const fetchStudentResponses = useCallback(async () => {
    const data = await fetchWithAuth(`http://localhost:2000/student/responses/${userEmail}`);
    if (data) setStudentResponses(data);
  }, [userEmail, token]);

  useEffect(() => {
    fetchAssignedFiles();
    fetchStudentResponses();
  }, [fetchAssignedFiles, fetchStudentResponses]);

  const submittedTaskIds = new Set(studentResponses.map(r => r.taskId));

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await fetch('http://localhost:2000/uploads/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (res.status === 401) return logoutAndRedirect();
    const data = await res.json();

    if (data.status) {
      alert("File uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchAssignedFiles(); // refresh
    } else {
      alert(data.message || "Upload failed.");
    }
  };

  const handleSubmitResponse = async (file) => {
    if (!file.responseFile) {
      alert("Please select a file to submit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file.responseFile);
    formData.append("taskId", file._id);
    formData.append("studentEmail", userEmail);
    formData.append("facultyName", file.facultyName);

    const res = await fetch("http://localhost:2000/student/submit-task", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (res.status === 401) return logoutAndRedirect();
    const data = await res.json();

    if (data.status) {
      alert("Response submitted successfully!");
      fetchAssignedFiles();
      fetchStudentResponses();
    } else {
      alert(data.message || "Failed to submit.");
    }
  };

  return (
    <div className="upload-container">
      <h1 className="upload-title">📤 Upload Your Documents</h1>
      <p className="upload-subtitle">Organize and share your academic materials efficiently.</p>

      {/* Assigned Files */}
      <section className="pdf-upload-card">
        <h2>Complete Your Task</h2>
        {assignedFiles.filter(f => !submittedTaskIds.has(f._id)).length === 0
          ? <p>No documents assigned to you yet.</p>
          : (
            <div className="assigned-list">
              {assignedFiles
                .filter(file => !submittedTaskIds.has(file._id))
                .map((file) => (
                  <div className="assigned-card" key={file._id}>
                    <div className="assigned-info">
                      <h3>Faculty: <span>{file.facultyName || 'Unknown'}</span></h3>
                      <p><strong>📝 Task:</strong> {file.taskText || 'No task provided'}</p>
                      {file.filename && (
                        <p>
                          <strong>📎 File:</strong>{' '}
                          <a
                            href={`http://localhost:2000/uploads/${file.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.originalname || 'Download'}
                          </a>
                        </p>
                      )}
                      <input
                        type="file"
                        className="submit-input"
                        onChange={(e) => {
                          const newFile = e.target.files[0];
                          setAssignedFiles(prev =>
                            prev.map(item =>
                              item._id === file._id ? { ...item, responseFile: newFile } : item
                            )
                          );
                        }}
                      />
                      <button
                        className="submit-btn"
                        onClick={() => handleSubmitResponse(file)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
      </section>

      {/* Upload New File */}
      <section className="upload-section subcategory-card">
        <h2 className="subcategory-title">Upload Your Files</h2>
        <label>
          File:
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            ref={fileInputRef}
            className="file-input"
          />
        </label>
        <button onClick={handleUpload} className="upload-btn">Upload</button>
      </section>
    </div>
  );
};

export default Upload;
