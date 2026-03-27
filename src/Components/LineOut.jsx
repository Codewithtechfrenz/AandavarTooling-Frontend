import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/LineOut.css";
import api from "../api";

function WorkOrder() {
  const [productName, setProductName] = useState("");
  const [productUOM, setProductUOM] = useState("");
  const [toolName, setToolName] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [machineName, setMachineName] = useState("");
  const [productQty, setProductQty] = useState("");
  const [toolQty, setToolQty] = useState("");
  const [workOrders, setWorkOrders] = useState([]);

  const [productOptions, setProductOptions] = useState([]);
  const [toolOptions, setToolOptions] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [uomOptions, setUOMOptions] = useState([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchProducts();
    fetchTools();
    fetchWorkers();
    fetchMachines();
    fetchUOMs();
    fetchWorkOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");
      setProductOptions(res.data?.data || []);
    } catch (err) {
      console.error("Product Error:", err);
      setProductOptions([]);
    }
  };

  const fetchTools = async () => {
    try {
      const res = await api.get("/activetools/activetool");
      setToolOptions(res.data?.data || []);
    } catch (err) {
      console.error("Tool Error:", err);
      setToolOptions([]);
    }
  };

  /* ================= WORKER ================= */
  const fetchWorkers = async () => {
    try {
      const res = await api.get("/activeworkers/getWorkers");
      setWorkerOptions(res.data?.data || []);
    } catch (err) {
      console.error("Worker Error:", err);
      setWorkerOptions([]);
    }
  };

  /* ================= MACHINE ================= */
  const fetchMachines = async () => {
    try {
      const res = await api.get("/activemachines/activemachine");
      setMachineOptions(res.data?.data || []);
    } catch (err) {
      console.error("Machine Error:", err);
      setMachineOptions([]);
    }
  };

  const fetchUOMs = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");

      if (res.data.status === 1) {
        const formatted = res.data.data.map(
          (u) => u.UOMName || u.uom_name || u
        );
        setUOMOptions(formatted);
      } else {
        setUOMOptions([]);
      }
    } catch (err) {
      console.error("UOM Error:", err);
      setUOMOptions([]);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const res = await api.get("/workorder/list");
      setWorkOrders(res.data?.data || []);
    } catch (err) {
      console.error("WorkOrder Error:", err);
      setWorkOrders([]);
    }
  };

  /* ================= CREATE ================= */
  const handleCreateWorkOrder = async () => {
    if (!productName || !productUOM || !productQty || !workerName || !machineName) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ProductName: productName,
      ProductUOM: productUOM,
      ToolName: toolName || null,
      WorkerName: workerName,
      MachineName: machineName,
      ProductQty: Number(productQty),
      ToolQty: Number(toolQty) || 0,
      Status: "Pending",
    };

    try {
      const res = await api.post("/workorder/create", payload);
      alert(res.data.message);

      if (res.data.status === 1) {
        fetchWorkOrders();
        clearForm();
      }
    } catch (err) {
      console.error(err);
      alert("Error creating work order");
    }
  };

  /* ================= COMPLETE ================= */
  const handleComplete = async (WorkOrderID) => {
    try {
      const res = await api.post("/workorder/complete", { WorkOrderID });
      alert(res.data.message);
      fetchWorkOrders();
    } catch (err) {
      console.error(err);
      alert("Error completing work order");
    }
  };

  /* ================= CLEAR ================= */
  const clearForm = () => {
    setProductName("");
    setProductUOM("");
    setToolName("");
    setWorkerName("");
    setMachineName("");
    setProductQty("");
    setToolQty("");
  };

  return (
    <div className="wo-page">
      <Sidebar />
      <Topbar />

      <div className="wo-header">
        <h1>Work Order</h1>
        <p>Create work orders with UOM</p>
      </div>

      <div className="wo-form">

        {/* PRODUCT */}
        <div className="wo-row">
          <div className="wo-group">
            <label>Product</label>
            <select value={productName} onChange={e => setProductName(e.target.value)}>
              <option value="">Select Product</option>
              {productOptions.map((p, i) => (
                <option key={i} value={typeof p === "string" ? p : p.ItemName}>
                  {typeof p === "string" ? p : p.ItemName}
                </option>
              ))}
            </select>
          </div>

          <div className="wo-group">
            <label>Product UOM</label>
            <select value={productUOM} onChange={e => setProductUOM(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.map((u, i) => (
                <option key={i} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="wo-group">
            <label>Product Qty</label>
            <input
              type="number"
              value={productQty}
              onChange={e => setProductQty(e.target.value)}
            />
          </div>
        </div>

        {/* TOOL */}
        <div className="wo-row">
          <div className="wo-group">
            <label>Tool</label>
            <select value={toolName} onChange={e => setToolName(e.target.value)}>
              <option value="">Select Tool</option>
              {toolOptions.map((t, i) => (
                <option key={i} value={typeof t === "string" ? t : t.ToolName}>
                  {typeof t === "string" ? t : t.ToolName}
                </option>
              ))}
            </select>
          </div>

          <div className="wo-group">
            <label>Tool Qty</label>
            <input
              type="number"
              value={toolQty}
              onChange={e => setToolQty(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ FIXED WORKER + MACHINE */}
        <div className="wo-row">
          <div className="wo-group">
            <label>Worker</label>
            <select
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
            >
              <option value="">Select Worker</option>

              {workerOptions.map((worker, index) => (
                <option
                  key={index}
                  value={worker?.WorkerName || worker}
                >
                  {worker?.WorkerName || worker}
                </option>
              ))}
            </select>
          </div>

          <div className="wo-group">
            <label>Machine</label>
            <select
              value={machineName}
              onChange={e => setMachineName(e.target.value)}
            >
              <option value="">Select Machine</option>

              {machineOptions.map((m, i) => (
                <option
                  key={i}
                  value={m?.MachineName || m}
                >
                  {m?.MachineName || m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="wo-btn" onClick={handleCreateWorkOrder}>
          Create Work Order
        </button>
      </div>

      {/* TABLE (UNCHANGED) */}
      <div className="wo-table-card">
        <h2>Work Orders</h2>

        <table className="wo-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>UOM</th>
              <th>Qty</th>
              <th>Tool</th>
              <th>Tool Qty</th>
              <th>Worker</th>
              <th>Machine</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {workOrders.length === 0 ? (
              <tr>
                <td colSpan="10">No Work Orders Found</td>
              </tr>
            ) : (
              workOrders.map((order, i) => (
                <tr key={i}>
                  <td>{order.WorkOrderID}</td>
                  <td>{order.ProductName}</td>
                  <td>{order.ProductUOM}</td>
                  <td>{order.ProductQty}</td>
                  <td>{order.ToolName || "-"}</td>
                  <td>{order.ToolQty || "-"}</td>
                  <td>{order.WorkerName}</td>
                  <td>{order.MachineName}</td>
                  <td>{order.Status}</td>
                  <td>
                    {order.Status === "Pending" && (
                      <button onClick={() => handleComplete(order.WorkOrderID)}>
                        Complete
                      </button>
                    )}
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