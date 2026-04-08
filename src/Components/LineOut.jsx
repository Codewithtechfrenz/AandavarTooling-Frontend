import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/LineOut.css";

function WorkOrder() {

  // ================= STATES =================
  const [date, setDate] = useState("");   // ✅ NEW DATE STATE
  const [toolName, setToolName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [toolQty, setToolQty] = useState("");
  const [machineName, setMachineName] = useState("");
  const [workerName, setWorkerName] = useState("");

  // ================= DROPDOWN OPTIONS =================
  const [toolOptions, setToolOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);

  // ================= TABLE =================
  const [list, setList] = useState([]);

  // ================= FETCH FUNCTIONS =================

  const fetchTools = async () => {
    try {
      const res = await api.get("/workorder/activetool");
      let data = res.data?.data || res.data?.result || res.data || [];
      setToolOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Tool Error:", err);
      setToolOptions([]);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await api.get("/workorder/activemachine");
      let data = res.data?.data || res.data?.result || res.data || [];
      setMachineOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Machine Error:", err);
      setMachineOptions([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/workorder/activeCategorie");
      let data = res.data?.data || res.data?.result || res.data || [];
      setCategoryOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Category Error:", err);
      setCategoryOptions([]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/activeworkers/getWorkers");
      if (res.data.status === 1) {
        const data = res.data.data.map(
          (w) => w.WorkerName || w.worker_name || w
        );
        setWorkerOptions(data);
      } else {
        setWorkerOptions([]);
      }
    } catch (err) {
      console.error("Worker Error:", err);
      setWorkerOptions([]);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/workorder/getlist");
      if (res.data.status === 1) {
        setList(res.data.data || []);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("List Error:", err);
      setList([]);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    fetchTools();
    fetchMachines();
    fetchCategories();
    fetchWorkers();
    fetchData();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !toolName || !toolQty) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      work_date: date,               // ✅ CHANGED
      tools: toolName,
      category_name: categoryName,
      tool_qty: Number(toolQty),
      machine_name: machineName,
      worker_name: workerName,
    };

    try {
      const res = await api.post("/workorder/createworkorder", payload);

      if (res.data.status === 1) {
        alert(res.data.message || "Saved Successfully");

        // CLEAR FORM
        setDate("");
        setToolName("");
        setCategoryName("");
        setToolQty("");
        setMachineName("");
        setWorkerName("");

        fetchData();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving data");
    }
  };

  // ================= COMPLETE =================
  const handleComplete = async (wo) => {
    if (!window.confirm("Mark as Completed?")) return;

    try {
      const res = await api.put(`/workorder/completeworkorder/${wo}`);
      if (res.data.status === 1) {
        alert("Work Order Completed");
        fetchData();
      }
    } catch (err) {
      console.error("Complete Error:", err);
    }
  };

  // ================= UI =================
  return (
    <div className="cs-page">
      <Sidebar />
      <Topbar />

      <div className="cs-header">
        <h1>Line Out Entry</h1>
      </div>

      {/* FORM */}
      <div className="cs-table-card">
        <h3>Create Work Order</h3>

        <form onSubmit={handleSubmit} className="cs-form">

          {/* ✅ DATE FIELD */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <select value={toolName} onChange={(e) => setToolName(e.target.value)}>
            <option value="">Select Tool</option>
            {toolOptions.map((t, i) => {
              const name = t?.ToolName || t?.tool_name || t;
              return <option key={i} value={name}>{name}</option>;
            })}
          </select>

          <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}>
            <option value="">Select Category</option>
            {categoryOptions.map((c, i) => {
              const name = c?.CategoryName || c?.category_name || c;
              return <option key={i} value={name}>{name}</option>;
            })}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Tool Qty"
            value={toolQty}
            onChange={(e) => setToolQty(e.target.value)}
            required
          />

          <select value={machineName} onChange={(e) => setMachineName(e.target.value)}>
            <option value="">Select Machine</option>
            {machineOptions.map((m, i) => {
              const name = m?.MachineName || m?.machine_name || m;
              return <option key={i} value={name}>{name}</option>;
            })}
          </select>

          <select value={workerName} onChange={(e) => setWorkerName(e.target.value)}>
            <option value="">Select Worker</option>
            {workerOptions.map((w, i) => (
              <option key={i} value={w}>{w}</option>
            ))}
          </select>

          <button type="submit">Save</button>
        </form>
      </div>

      {/* TABLE */}
      <div className="cs-table-card">
        <h3>Work Order List</h3>

        <table className="cs-table">
          <thead>
            <tr>
              <th>Date</th> {/* ✅ CHANGED */}
              <th>Tool</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Machine</th>
              <th>Worker</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="7">No Data</td></tr>
            ) : (
              list.map((item, i) => (
                <tr key={i}>
                  <td>{item.work_date}</td> {/* ✅ CHANGED */}
                  <td>{item.tools}</td>
                  <td>{item.category_name}</td>
                  <td>{item.tool_qty}</td>
                  <td>{item.machine_name}</td>
                  <td>{item.worker_name}</td>
                  <td>
                    <button
                      onClick={() => handleComplete(item.work_order_no)}
                      disabled={item.status === "Completed"}
                    >
                      {item.status}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkOrder;


