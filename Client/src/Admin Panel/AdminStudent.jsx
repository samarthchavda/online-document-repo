import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminStudent = () => {
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:2000/users/data");
      const students = res.data.filter((user) => user.role === "student");
      setStudentList(students);
    } catch (err) {
      console.error("Error fetching student data:", err);
      alert("Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await axios.delete(`http://localhost:2000/users/delete/${id}`);
      setStudentList((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Student List", 14, 15);

    const tableColumn = ["Name", "Email"];
    const tableRows = studentList.map((student) => [student.name, student.email]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("student_list.pdf");
  };

  if (loading) return <div>Loading student data...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Data</h2>
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
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {studentList.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No students found.
              </td>
            </tr>
          ) : (
            studentList.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <button
                    onClick={() => deleteStudent(student._id)}
                    style={{ color: "red", cursor: "pointer" }}
                    title="Delete Student"
                  >
                    Delete
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

export default AdminStudent;
