import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css"; // Reuse same CSS
import api from "../api"; // ✅ USE BASE API

function ToolInwardEntry() {
  const navigate = useNavigate();

  const [toolName, setToolName] = useState("");
  const [uom, setUom] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");

  const [toolOptions, setToolOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);

  /* LOAD DROPDOWNS */
  useEffect(() => {
    fetchTools();
    fetchUOMs();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await api.get("/Toolstock/activetool"); // ✅ use api
      setToolOptions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tools:", err);
    }
  };

  const fetchUOMs = async () => {
    try {
      const res = await api.get("/Toolstock/activeuom"); // ✅ use api
      setUomOptions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching UOMs:", err);
    }
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!toolName || !uom || !quantity || !rate) {
      alert("Enter all fields");
      return;
    }

    try {
      const payload = {
        ToolName: toolName,
        UOMName: uom,
        Quantity: Number(quantity),
        Rate: Number(rate),
      };

      await api.post("/toolinward/toolinwards", payload); // ✅ use api

      alert("Tool Inward submitted & stock updated!");

      // Redirect to Tool Current Stock (Tool Stack)
      navigate("/tool-stock");
    } catch (err) {
      console.error("Error submitting Tool Inward:", err);
      alert("Error updating Tool stock");
    }

    // Reset form
    setToolName("");
    setUom("");
    setQuantity("");
    setRate("");
  };

  return (
    <div className="ie-page">
      <Sidebar />
      <Topbar />

      <div className="ie-header">
        <h1>Tool Inward Entry</h1>
      </div>

      <div className="ie-form">
        <div className="ie-row">
          <div className="ie-group">
            <label>Tool Name</label>
            <select value={toolName} onChange={(e) => setToolName(e.target.value)}>
              <option value="">Select Tool</option>
              {toolOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="ie-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ie-row">
          <div className="ie-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="ie-group">
            <label>Rate</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
        </div>

        <button className="ie-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default ToolInwardEntry;