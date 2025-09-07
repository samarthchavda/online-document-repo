import React, { useEffect, useState } from "react";
import "./View.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const View = () => {
  const [userUploads, setUserUploads] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [studentResponses, setStudentResponses] = useState({});
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn || !userEmail || !token) {
      toast.error("Please login to view documents!", { autoClose: 1000 });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    fetchUserUploads();
    fetchFacultyAssignedTasks();
    fetchStudentResponses();
  }, [navigate, userEmail, token]);

  // Fetch user's own uploads
  const fetchUserUploads = () => {
    fetch(`http://localhost:2000/uploads/user/${userEmail}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUserUploads(data);
      })
      .catch((err) => console.error("User uploads error:", err));
  };

  // Fetch faculty assigned tasks with files
  const fetchFacultyAssignedTasks = () => {
    fetch(`http://localhost:2000/student/assigned-files/${userEmail}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setAssignedTasks(data);
      })
      .catch((err) => console.error("Student assigned tasks error:", err));
  };

  // Fetch student responses to tasks
  const fetchStudentResponses = () => {
    fetch(`http://localhost:2000/student/responses/${userEmail}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          const responseMap = {};
          data.forEach((resp) => {
            responseMap[resp.taskId] = resp;
          });
          setStudentResponses(responseMap);
        }
      })
      .catch((err) => console.error("Student responses fetch error:", err));
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(`http://localhost:2000/uploads/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Deleted successfully");
        fetchUserUploads();
      } else {
        toast.error("Failed to delete file");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error during delete");
    }
  };

  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm("Are you sure you want to delete your submission?")) return;

    try {
      const res = await fetch(`http://localhost:2000/student/delete-response/${responseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Response deleted successfully");
        fetchStudentResponses();
      } else {
        toast.error("Failed to delete response");
      }
    } catch (err) {
      console.error("Delete response error:", err);
      toast.error("Server error during delete");
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleSubmitResponse = async (taskId, facultyName) => {
    if (!uploadFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("taskId", taskId);
    formData.append("studentEmail", userEmail);
    formData.append("facultyName", facultyName);

    try {
      const res = await fetch("http://localhost:2000/student/submit-task", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.status) {
        toast.success("Response submitted successfully!");
        setUploadFile(null);
        setUploadingTaskId(null);
        fetchStudentResponses();
      } else {
        toast.error(data.message || "Failed to submit response");
      }
    } catch (err) {
      console.error("Submit response error:", err);
      toast.error("Server error during submission");
    }
  };

  return (
    <div className="view-page">
      <ToastContainer />
      <h1>📂 My Documents</h1>

      {/* Student's own uploads */}
      <section className="view-section">
        <h2>🧑‍🎓 Your Uploads</h2>
        {userUploads.length === 0 ? (
          <p>No uploads yet.</p>
        ) : (
          <ul>
            {userUploads.map((file) => (
              <li key={file._id}>
                <span>{file.originalname}</span>
                <div className="action-buttons">
                  <a
                    href={`http://localhost:2000/uploads/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDeleteUpload(file._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Faculty assigned tasks */}
      <section className="view-section">
        <h2>👨‍🏫 Faculty Shared Files</h2>
        {assignedTasks.length === 0 ? (
          <p>No faculty assigned files or tasks yet.</p>
        ) : (
          <ul>
            {assignedTasks.map((task) => {
              const response = studentResponses[task._id];
              return (
                <li key={task._id} className="faculty-task-item">
                  <p><strong>Task:</strong> {task.taskText}</p>
                  <p><strong>Faculty:</strong> {task.facultyName}</p>
                  {task.filename && (
                    <p>
                      Assigned File:{" "}
                      <a
                        href={`http://localhost:2000/uploads/${task.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {task.originalname}
                      </a>
                    </p>
                  )}

                  {response ? (
                    <div className="student-response">
                      <p>
                        <strong>Your Submission:</strong>{" "}
                        <a
                          href={`http://localhost:2000/uploads/${response.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {response.originalname}
                        </a>
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            response.status === "approved"
                              ? "status-approved"
                              : response.status === "rejected"
                                ? "status-rejected"
                                : "status-pending"
                          }
                        >
                          {response.status}
                        </span>
                      </p>
                      {/* <button
                        className="delete-btn"
                        onClick={() => handleDeleteResponse(response._id)}
                      >
                        Delete Response
                      </button> */}
                    </div>
                  ) : (
                    <div className="submit-response">
                      {uploadingTaskId === task._id ? (
                        <>
                          <input type="file" onChange={handleFileChange} />
                          <button
                            onClick={() => handleSubmitResponse(task._id, task.facultyName)}
                          >
                            Submit Response
                          </button>
                          <button onClick={() => setUploadingTaskId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setUploadingTaskId(task._id);
                            setUploadFile(null);
                          }}
                        >
                          Submit Response
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default View;
