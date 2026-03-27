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
      setProductOptions(res.data.status === 1 ? res.data.data : []);
    } catch (err) {
      console.error("Product Error:", err);
      setProductOptions([]);
    }
  };
 
  const fetchTools = async () => {
    try {
      const res = await api.get("/activetools/activetool");
      setToolOptions(res.data.status === 1 ? res.data.data : []);
    } catch (err) {
      console.error("Tool Error:", err);
      setToolOptions([]);
    }
  };
 
  const fetchWorkers = async () => {
    try {
      const res = await api.get("/activeworkers/getWorkers");
      setWorkerOptions(res.data.status === 1 ? res.data.data : []);
    } catch (err) {
      console.error("Worker Error:", err);
      setWorkerOptions([]);
    }
  };
 
  const fetchMachines = async () => {
    try {
      const res = await api.get("/activemachines/activemachine");
      setMachineOptions(res.data.status === 1 ? res.data.data : []);
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
      setWorkOrders(res.data.status === 1 ? res.data.data : []);
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
      ProductName: productName.trim(),
      ProductUOM: productUOM.trim(),
      ToolName: toolName ? toolName.trim() : null,
      WorkerName:
        typeof workerName === "object"
          ? workerName.WorkerName || workerName.worker_name
          : workerName.trim(),
      MachineName:
        typeof machineName === "object"
          ? machineName.MachineName || machineName.machine_name
          : machineName.trim(),
      ProductQty: Number(productQty),
      ToolQty: Number(toolQty) || 0,
      Status: "Pending",
    };
 
    try {
      const res = await api.post("/workorder/create", payload);
 
      if (res.data.status === 1) {
        alert(res.data.message);
        fetchWorkOrders();
        clearForm();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating work order");
    }
  };
 
  /* ================= COMPLETE ================= */
  const handleComplete = async (WorkOrderID) => {
    console.log("Completing WorkOrderID:", WorkOrderID);
 
    try {
      const res = await api.post("/workorder/complete", { WorkOrderID });
 
      console.log("API RESPONSE:", res.data);
 
      if (res.data.status === 1) {
        alert(res.data.message);
        fetchWorkOrders();
      } else {
        alert(res.data.error || res.data.message);
      }
    } catch (err) {
      console.error("FULL ERROR:", err);
 
      if (err.response) {
        alert(err.response.data?.message || "Server error");
      } else if (err.request) {
        alert("Backend not responding");
      } else {
        alert(err.message);
      }
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
        {/* ===== PRODUCT ===== */}
        <div className="wo-row">
          <div className="wo-group">
            <label>Product</label>
            <select value={productName} onChange={e => setProductName(e.target.value)}>
              <option value="">Select Product</option>
              {productOptions.map((p, i) => {
                const name = typeof p === "string" ? p : p.ItemName || p.product_name;
                return (
                  <option key={i} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
 
          <div className="wo-group">
            <label>Product UOM</label>
            <select value={productUOM} onChange={e => setProductUOM(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.length > 0 ? (
                uomOptions.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))
              ) : (
                <option disabled>No UOM Found</option>
              )}
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
 
        {/* ===== TOOL ===== */}
        <div className="wo-row">
          <div className="wo-group">
            <label>Tool</label>
            <select value={toolName} onChange={e => setToolName(e.target.value)}>
              <option value="">Select Tool</option>
              {toolOptions.map((t, i) => {
                const name = typeof t === "string" ? t : t.ToolName || t.tool_name;
                return (
                  <option key={i} value={name}>
                    {name}
                  </option>
                );
              })}
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
 
        {/* ===== WORKER + MACHINE ===== */}
        <div className="wo-row">
          <div className="wo-group">
            <label>Worker</label>
            <select value={workerName} onChange={e => setWorkerName(e.target.value)}>
              <option value="">Select Worker</option>
              {workerOptions.map((w, i) => {
                const name = typeof w === "string" ? w : w.WorkerName || w.worker_name;
                return (
                  <option key={i} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
 
          <div className="wo-group">
            <label>Machine</label>
            <select value={machineName} onChange={e => setMachineName(e.target.value)}>
              <option value="">Select Machine</option>
              {machineOptions.map((m, i) => {
                const name = typeof m === "string" ? m : m.MachineName || m.machine_name;
                return (
                  <option key={i} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
 
        <button className="wo-btn" onClick={handleCreateWorkOrder}>
          Create Work Order
        </button>
      </div>
 
      {/* ===== TABLE ===== */}
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
              <tr><td colSpan="10">No Work Orders Found</td></tr>
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