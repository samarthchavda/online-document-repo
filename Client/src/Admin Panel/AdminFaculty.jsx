import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]); 
  const [pendingList, setPendingList] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Fetch approved and pending faculties
  const fetchFaculties = async () => {
    try {
      setLoading(true);

      // Approved faculties
      const resUsers = await axios.get("http://localhost:2000/users/data");
      const faculties = resUsers.data.filter((user) => user.role === "faculty");
      setFacultyList(faculties);

      // Pending requests
      const resPending = await axios.get("http://localhost:2000/admin/faculty-requests");
      setPendingList(resPending.data);

    } catch (err) {
      console.error("Error fetching faculty data:", err);
      alert("Failed to fetch faculty data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Delete approved faculty
  const deleteFaculty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;

    try {
      await axios.delete(`http://localhost:2000/users/delete/${id}`);
      setFacultyList((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Error deleting faculty:", err);
      alert("Failed to delete faculty");
    }
  };

  // Approve or reject pending faculty signup
  const handlePendingAction = async (id, approve) => {
    try {
      await axios.post(`http://localhost:2000/admin/faculty-approve/${id}`, { approve });
      // Refresh lists
      fetchFaculties();
    } catch (err) {
      console.error("Error updating faculty status:", err);
      alert("Failed to update status");
    }
  };

  // Export approved faculties to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Faculty List", 14, 15);

    const tableColumn = ["Name", "Email"];
    const tableRows = facultyList.map((faculty) => [faculty.name, faculty.email]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("faculty_list.pdf");
  };

  if (loading) return <div>Loading faculty data...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Approved Faculty</h2>
      <button
        onClick={exportToPDF}
        style={{ marginBottom: "10px", padding: "8px 16px", cursor: "pointer" }}
      >
        Export as PDF
      </button>

      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {facultyList.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No approved faculty found.
              </td>
            </tr>
          ) : (
            facultyList.map((faculty) => (
              <tr key={faculty._id}>
                <td>{faculty.name}</td>
                <td>{faculty.email}</td>
                <td>
                  <button
                    onClick={() => deleteFaculty(faculty._id)}
                    style={{ color: "red", cursor: "pointer" }}
                    title="Delete Faculty"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>Pending Faculty Signup Requests</h2>
      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th>ID Photo</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingList.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No pending requests.
              </td>
            </tr>
          ) : (
            pendingList.map((faculty) => (
              <tr key={faculty._id}>
                <td>
                  <a
                    href={`http://localhost:2000/uploads/${faculty.facultyIdPhoto}`}
                    download={faculty.facultyIdPhoto}
                    target="_blank"
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      backgroundColor: "#4caf50",
                      color: "#fff",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "12px",
                    }}
                  >
                    Download ID
                  </a>
                </td>
                <td>{faculty.name}</td>
                <td>{faculty.email}</td>
                <td>
                  <button
                    onClick={() => handlePendingAction(faculty._id, true)}
                    style={{ color: "green", marginRight: "8px", cursor: "pointer" }}
                    title="Approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handlePendingAction(faculty._id, false)}
                    style={{ color: "red", cursor: "pointer" }}
                    title="Reject"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


    </div>
  );
};

export default AdminFaculty;
