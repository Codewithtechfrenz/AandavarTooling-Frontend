import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api";

function InwardEntry() {
  const navigate = useNavigate();

  /* STATES */
  const [products, setProducts] = useState([]);
  const [itemCodes, setItemCodes] = useState([]);
  const [uoms, setUoms] = useState([]);

  const [selectedItemName, setSelectedItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* HELPERS */
  const extractList = (res) => {
    // If res.data is already an array, return it
    if (Array.isArray(res.data)) return res.data;

    // If res.data.data is an array, return it
    if (Array.isArray(res.data?.data)) return res.data.data;

    // If nested array exists inside res.data.data
    const nested = res.data?.data
      ? Object.values(res.data.data).find((val) => Array.isArray(val))
      : null;
    if (nested) return nested;

    return [];
  };

  /* API CALLS */
  useEffect(() => {
    loadProducts();
    loadItemCodes();
    loadUoms();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/items/activeitem");
      const list = extractList(res);
      console.log("Products:", list); // DEBUG
      setProducts(list);
    } catch (err) {
      console.error("Product Load Error:", err);
      setProducts([]);
    }
  };

  const loadItemCodes = async () => {
    try {
      const res = await api.get("/activeitems/activeitemcode");
      const list = extractList(res);
      console.log("Item Codes:", list); // DEBUG
      setItemCodes(list);
    } catch (err) {
      console.error("Item Code Load Error:", err);
      setItemCodes([]);
    }
  };

  const loadUoms = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");
      const list = extractList(res);
      console.log("UOMs:", list); // DEBUG
      setUoms(list);
    } catch (err) {
      console.error("UOM Load Error:", err);
      setUoms([]);
    }
  };

  /* HANDLE CHANGES */
  const handleItemChange = (e) => {
    const name = e.target.value;
    setSelectedItemName(name);

    const item = products.find((p) => p.ItemName === name);
    if (item) {
      setItemCode(item.ItemCode);
    } else {
      setItemCode("");
    }
  };

  const handleCodeChange = (e) => {
    const code = e.target.value;
    setItemCode(code);

    const item = products.find((p) => p.ItemCode === code);
    if (item) {
      setSelectedItemName(item.ItemName);
    } else {
      setSelectedItemName("");
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedItemName ||
      !itemCode ||
      !uom ||
      !qty ||
      isNaN(qty) ||
      !rate ||
      isNaN(rate)
    ) {
      alert("Please fill all fields correctly");
      return;
    }

    const payload = {
      ItemName: selectedItemName.trim(),
      ItemCode: itemCode.trim(),
      UOMName: uom.trim(),
      Quantity: Number(qty),
      Rate: Number(rate),
      Status: "Completed",
    };

    try {
      const res = await api.post("/inward/iteminward", payload);
      alert(res.data.message || "Saved successfully");
      resetForm();
      navigate("/current-stock", { state: { refresh: true } });
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving inward entry");
    }
  };

  const resetForm = () => {
    setSelectedItemName("");
    setItemCode("");
    setUom("");
    setQty("");
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
        {/* ITEM NAME & CODE */}
        <div className="ie-row">
          <div className="ie-group">
            <label>Item Name</label>
            <select value={selectedItemName} onChange={handleItemChange}>
              <option value="">Select Item</option>
              {products.map((item) => (
                <option key={item.ItemCode} value={item.ItemName}>
                  {item.ItemName}
                </option>
              ))}
            </select>
          </div>

          <div className="ie-group">
            <label>Item Code</label>
            <select value={itemCode} onChange={handleCodeChange}>
              <option value="">Select Code</option>
              {itemCodes.map((codeItem) => (
                <option key={codeItem} value={codeItem}>
                  {codeItem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* UOM & QUANTITY */}
        <div className="ie-row">
          <div className="ie-group">
            <label>UOM</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value)}
            >
              <option value="">Select UOM</option>
              {uoms.map((u) => (
                <option key={u.UOMName || u} value={u.UOMName || u}>
                  {u.UOMName || u}
                </option>
              ))}
            </select>
          </div>

          <div className="ie-group">
            <label>Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
        </div>

        {/* RATE */}
        <div className="ie-row">
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