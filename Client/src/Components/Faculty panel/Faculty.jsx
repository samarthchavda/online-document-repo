import React, { useEffect, useState } from 'react';
import './Faculty.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Faculty = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [taskText, setTaskText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('assign');

  const facultyName = localStorage.getItem("userName");
  const facultyEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    // Fetch all students
    fetch("http://localhost:2000/faculty/students")
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setStudents(data.students);
        } else {
          toast.error("Failed to load students");
        }
      })
      .catch(err => console.error("Failed to fetch students:", err));

    // Fetch submissions for this faculty
    fetch(`http://localhost:2000/faculty/responses/${facultyName}`)
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(err => console.error("Failed to fetch submissions:", err));
  }, [facultyName]);


  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmitTask = async () => {
    if (!selectedStudent) {
      toast.error("Select a student");
      return;
    }
    if (!taskText && !pdfFile) {
      toast.error("Provide a task or a file");
      return;
    }

    const formData = new FormData();
    const dataPayload = {
      facultyEmail,
      facultyName,
      studentEmail: selectedStudent,
      task: taskText,
    };
    formData.append("data", JSON.stringify(dataPayload));
    if (pdfFile) formData.append("file", pdfFile);

    try {
      const res = await fetch("http://localhost:2000/faculty/assign-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Task assigned successfully!");
        setTaskText('');
        setPdfFile(null);
        setSelectedStudent('');
      } else {
        toast.error(data.message || "Failed to assign task");
      }
    } catch (err) {
      console.error("Assign error:", err);
      toast.error("Server error");
    }
  };

  const handleGradeSubmission = (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this as '${status}'?`)) return;

    fetch(`http://localhost:2000/faculty/grade-submission/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          toast.success(data.message);
          setSubmissions(prev =>
            prev.map(sub => (sub._id === id ? { ...sub, status } : sub))
          );
        } else {
          toast.error("Failed to update status");
        }
      })
      .catch(err => {
        console.error("Grade update error:", err);
        toast.error("Server error");
      });
  };

  return (
    <div className="faculty-container">
      <ToastContainer />

      <div className="faculty-tab-buttons">
        <button
          className={activeTab === 'submissions' ? 'active-tab' : ''}
          onClick={() => setActiveTab('submissions')}
        >
          Student Submissions
        </button>
        <button
          className={activeTab === 'assign' ? 'active-tab' : ''}
          onClick={() => setActiveTab('assign')}
        >
          Give Assignments
        </button>
      </div>

      {activeTab === 'assign' && (
        <div>
          <h2>📋 Assign Task to Student</h2>

          <label>Select Student:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="faculty-input"
          >
            <option value="">-- Select Student --</option>
            {students.map(student => (
              <option key={student._id} value={student.email}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>

          <label>Task:</label>
          <textarea
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Enter task details..."
            className="faculty-input"
          />

          <label>Optional PDF Upload:</label>
          <input type="file" onChange={handleFileChange} className="faculty-input" />

          <button onClick={handleSubmitTask} className="faculty-btn">Assign</button>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div>
          <h2>📥 Student Submissions</h2>
          {submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <table className="submission-table">
              <thead>
                <tr>
                  <th>Student Email</th>
                  <th>Submitted File</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td>{sub.studentEmail}</td>
                    <td>
                      <a
                        href={`http://localhost:2000/uploads/${sub.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sub.originalname || 'View'}
                      </a>
                    </td>
                    <td>{sub.status}</td>
                    <td>
                      {sub.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleGradeSubmission(sub._id, 'approved')}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleGradeSubmission(sub._id, 'rejected')}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {sub.status === 'approved' && (
                        <button
                          onClick={() => handleGradeSubmission(sub._id, 'rejected')}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      )}
                      {sub.status === 'rejected' && (
                        <button
                          onClick={() => handleGradeSubmission(sub._id, 'approved')}
                          className="approve-btn"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Faculty;
