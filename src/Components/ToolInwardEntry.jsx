import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api";

function ToolInwardEntry() {
  const navigate = useNavigate();

  const [toolName, setToolName] = useState("");
  const [uom, setUom] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");

  const [toolOptions, setToolOptions] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);

  const [uomOptions, setUomOptions] = useState([]);

  /* LOAD DROPDOWNS */
  useEffect(() => {
    fetchTools();
    fetchUOMs();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await api.get("/Toolstock/activetool");
      const tools = res.data.data || [];
      setToolOptions(tools);
      setFilteredTools(tools);
    } catch (err) {
      console.error("Error fetching tools:", err);
    }
  };

  const fetchUOMs = async () => {
    try {
      const res = await api.get("/Toolstock/activeuom");
      setUomOptions(res.data.data || []);
    } catch (err) {
      console.error("Error fetching UOMs:", err);
    }
  };

  /* SEARCH FILTER */
  const handleToolSearch = (e) => {
    const value = e.target.value;
    setToolName(value);

    const filtered = toolOptions.filter((tool) =>
      tool.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredTools(filtered);
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

      await api.post("/toolinward/toolinwards", payload);

      alert("Tool Inward submitted & stock updated!");

      navigate("/tool-stock");
    } catch (err) {
      console.error("Error submitting Tool Inward:", err);
      alert("Error updating Tool stock");
    }

    setToolName("");
    setUom("");
    setQuantity("");
    setRate("");
    setFilteredTools(toolOptions);
  };

  return (
    <div className="ie-page">
      <Sidebar />
      <Topbar />

      <div className="ie-header">
        <h1>Tool Inward Entry</h1>
      </div>

      <div className="ie-form">

        {/* ROW 1 */}
        <div className="ie-row">
          <div className="ie-group">
            <label>Tool Name</label>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Tool..."
              value={toolName}
              onChange={handleToolSearch}
            />

            {/* Same Dropdown UI */}
            <select
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
            >
              <option value="">Select Tool</option>
              {filteredTools.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="ie-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 2 */}
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