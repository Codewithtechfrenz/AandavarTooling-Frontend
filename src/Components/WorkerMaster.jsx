import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/WorkerMaster.css";

function WorkerMaster() {
  const [workerCode, setWorkerCode] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerDepartment, setWorkerDepartment] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [salary, setSalary] = useState(""); // ✅ ADDED

  const [workerList, setWorkerList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    try {
      const date = new Date(dateValue);
      return isNaN(date) ? "-" : date.toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  /* ================= FETCH WORKERS ================= */
  const fetchWorkers = async () => {
    try {
      const res = await api.get("/workers/getWorkers");

      const data = Array.isArray(res.data.data) ? res.data.data : [];

      const formattedData = data.map((item) => ({
        id: item.SI,
        workerCode: item.WorkerCode,
        workerName: item.WorkerName,
        workerDepartment: item.WorkerDepartment,
        joiningDate: formatDate(item.WorkerJoiningDate),
        salary: item.Salary, // ✅ ADDED
        created: formatDate(item.created_at || item.CreatedAt || item.createdAt),
        updated: formatDate(item.updated_at || item.UpdatedAt || item.updatedAt),
      }));

      setWorkerList(formattedData);
      localStorage.setItem("workerData", JSON.stringify(formattedData));
    } catch (err) {
      console.error("Fetch Workers API Error:", err);

      const stored = localStorage.getItem("workerData");
      setWorkerList(stored ? JSON.parse(stored) : []);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const updateStorage = (data) => {
    localStorage.setItem("workerData", JSON.stringify(data));
    setWorkerList(data);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async () => {
    if (!workerCode || !workerName) {
      alert("Enter Worker Code and Name");
      return;
    }

    try {
      if (editIndex !== null) {
        // UPDATE
        const res = await api.post("/workers/updateWorker", {
          SI: workerList[editIndex].id,
          WorkerCode: workerCode,
          WorkerName: workerName,
          WorkerDepartment: workerDepartment,
          WorkerJoiningDate: joiningDate,
          Salary: salary, // ✅ ADDED
        });

        if (res.data.status === 0)
          throw new Error(res.data.message || "Update Failed");

        alert("Worker updated successfully");
      } else {
        // CREATE
        const res = await api.post("/workers/createWorker", {
          WorkerCode: workerCode,
          WorkerName: workerName,
          WorkerDepartment: workerDepartment,
          WorkerJoiningDate: joiningDate,
          Salary: salary, // ✅ ADDED
        });

        if (res.data.status === 0)
          throw new Error(res.data.message || "Create Failed");

        alert("Worker created successfully");
      }

      await fetchWorkers();

      setEditIndex(null);
      setWorkerCode("");
      setWorkerName("");
      setWorkerDepartment("");
      setJoiningDate("");
      setSalary(""); // ✅ ADDED
    } catch (error) {
      console.error("Worker Submit Error:", error);
      alert(error.message || "Failed to save worker");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (index) => {
    const item = workerList[index];
    if (!item) return;

    setWorkerCode(item.workerCode);
    setWorkerName(item.workerName);
    setWorkerDepartment(item.workerDepartment);
    setJoiningDate(item.joiningDate);
    setSalary(item.salary); // ✅ ADDED
    setEditIndex(index);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (index) => {
    const item = workerList[index];
    if (!item || !item.id) return alert("Invalid worker selected");

    if (!window.confirm("Are you sure you want to delete this worker?")) return;

    try {
      const res = await api.post("/workers/deleteWorker", { SI: item.id });

      if (res.data.status === 0)
        throw new Error(res.data.message || "Delete Failed");

      alert("Worker deleted successfully");
      await fetchWorkers();
    } catch (error) {
      console.error("Delete Worker Error:", error);
      alert("Failed to delete worker");
    }
  };

  /* ================= SEARCH ================= */
  const filteredData = workerList.filter(
    (item) =>
      item.workerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workerDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="worker-page">
      <Sidebar />
      <Topbar />

      <div className="worker-header">
        <h1>Worker Master</h1>
        <p>Manage workers and employee records</p>
      </div>

      <div className="worker-form">
        <div className="form-row">
          <div className="form-group">
            <label>Worker Code</label>
            <input
              value={workerCode}
              onChange={(e) => setWorkerCode(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Worker Name</label>
            <input
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Worker Department</label>
            <input
              value={workerDepartment}
              onChange={(e) => setWorkerDepartment(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ SALARY FIELD ADDED (UI unchanged, just extra field) */}
        <div className="form-row">
          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
        </div>

        <button className="add-btn" onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="worker-search">
        <i className="fa fa-search"></i>
        <input
          type="text"
          placeholder="Search worker..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="worker-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Worker Code</th>
              <th>Worker Name</th>
              <th>Worker Department</th>
              <th>Joining Date</th>
              <th>Salary</th> {/* ✅ ADDED */}
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9">No Worker Found</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.workerCode}</td>
                  <td>{item.workerName}</td>
                  <td>{item.workerDepartment}</td>
                  <td>{item.joiningDate}</td>
                  <td>{item.salary}</td> {/* ✅ ADDED */}
                  <td>
                    <button onClick={() => handleEdit(index)}>
                      <i className="fa fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(index)}>
                      <i className="fa fa-trash"></i>
                    </button>
                  </td>
                  <td>{item.created}</td>
                  <td>{item.updated}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkerMaster;