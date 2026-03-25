import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api"; // ✅ USE BASE URL
 
function InwardEntry() {
  const navigate = useNavigate();
 
  const [itemName, setItemName] = useState("");
  const [uom, setUom] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [rate, setRate] = useState("");
 
  const [uomOptions, setUomOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
 
  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchUOMs();
    fetchItems();
  }, []);
 
  const fetchUOMs = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");
 
      console.log("UOM API:", res.data); // ✅ DEBUG
 
      if (res.data.status === 1) {
        setUomOptions(res.data.data);
      } else {
        setUomOptions([]);
      }
    } catch (err) {
      console.error("UOM Error:", err);
      setUomOptions([]);
    }
  };
 
  const fetchItems = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");
 
      console.log("ITEM API:", res.data); // ✅ DEBUG
 
      if (res.data.status === 1) {
        setItemOptions(res.data.data);
      } else {
        setItemOptions([]);
      }
    } catch (err) {
      console.error("Item Error:", err);
      setItemOptions([]);
    }
  };
 
  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!itemName || !itemQty || !rate || !uom) {
      alert("Enter all fields");
      return;
    }
 
    try {
      const payload = {
        ItemName: itemName,
        UOMName: uom,
        Quantity: Number(itemQty),
        Rate: Number(rate),
        Status: "Completed",
      };
 
      const res = await api.post("/inward/iteminward", payload);
 
      alert(res.data.message || "Inward submitted & stock updated!");
 
      // Redirect
      navigate("/current-stock");
 
    } catch (err) {
      console.error(err);
      alert("Error updating stock");
    }
 
    // Reset form
    setItemName("");
    setUom("");
    setItemQty("");
    setRate("");
  };
 
  return (
    <div className="ie-page">
      <Sidebar />
      <Topbar />
 
      <div className="ie-header">
        <h1>Product Inward Entry</h1>
      </div>
 
      <div className="ie-form">
        {/* ===== ROW 1 ===== */}
        <div className="ie-row">
          <div className="ie-group">
            <label>Item Name</label>
            <select
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            >
              <option value="">Select Item</option>
 
              {itemOptions.map((item, i) => (
                <option
                  key={i}
                  value={
                    typeof item === "string"
                      ? item
                      : item.ItemName || item.item_name
                  }
                >
                  {typeof item === "string"
                    ? item
                    : item.ItemName || item.item_name}
                </option>
              ))}
            </select>
          </div>
 
          <div className="ie-group">
            <label>UOM</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value)}
            >
              <option value="">Select UOM</option>
 
              {uomOptions.length > 0 ? (
                uomOptions.map((u, i) => (
                  <option
                    key={i}
                    value={u.UOMName || u.uom_name || u}
                  >
                    {u.UOMName || u.uom_name || u}
                  </option>
                ))
              ) : (
                <option disabled>No UOM Found</option>
              )}
            </select>
          </div>
        </div>
 
        {/* ===== ROW 2 ===== */}
        <div className="ie-row">
          <div className="ie-group">
            <label>Quantity</label>
            <input
              type="number"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
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
 
export default InwardEntry;