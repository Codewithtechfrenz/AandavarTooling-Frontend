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

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* HELPER TO EXTRACT ARRAY FROM API RESPONSE */
  const extractList = (res) => {
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.status === 1 && Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  };

  /* LOAD DATA */
  useEffect(() => {
    loadProducts();
    loadItemCodes();
    loadUoms();
  }, []);

  /* FETCH ITEM NAMES */
  const loadProducts = async () => {
    try {
      const res = await api.get("/items/activeitem");
      setProducts(extractList(res));
    } catch (error) {
      console.error("Product API Error:", error);
      setProducts([]);
    }
  };

  /* FETCH ITEM CODES */
  const loadItemCodes = async () => {
    try {
      const res = await api.get("/items/activeitemcode");
      setItemCodes(extractList(res));
    } catch (error) {
      console.error("Item Code API Error:", error);
      setItemCodes([]);
    }
  };

  /* FETCH UOMS */
  const loadUoms = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");
      setUoms(extractList(res));
    } catch (error) {
      console.error("UOM API Error:", error);
      setUoms([]);
    }
  };

  /* ITEM NAME CHANGE */
  const handleItemChange = (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedItem(null);
      setItemCode("");
      return;
    }

    const item = products.find((p) => String(p.ItemID) === String(id));
    if (item) {
      setSelectedItem(item);
      setItemCode(item.ItemCode);
    }
  };

  /* ITEM CODE CHANGE */
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setItemCode(code);

    if (!code) {
      setSelectedItem(null);
      return;
    }

    const item = products.find((p) => p.ItemCode === code);
    if (item) {
      setSelectedItem(item);
    }
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!selectedItem || !uom || !qty || isNaN(qty) || !rate || isNaN(rate)) {
      alert("Please fill all fields correctly");
      return;
    }

    const payload = {
      ItemID: selectedItem.ItemID,
      ItemName: selectedItem.ItemName.trim(),
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
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Error saving inward");
    }
  };

  /* RESET FORM */
  const resetForm = () => {
    setSelectedItem(null);
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

        {/* ROW 1 */}
        <div className="ie-row">
          <div className="ie-group">
            <label>Item Name</label>
            <select value={selectedItem?.ItemID || ""} onChange={handleItemChange}>
              <option value="">Select Item</option>
              {products.map((item) => (
                <option key={item.ItemID} value={item.ItemID}>
                  {item.ItemName}
                </option>
              ))}
            </select>
          </div>

          <div className="ie-group">
            <label>Item Code</label>
            <select value={itemCode} onChange={handleCodeChange}>
              <option value="">Select Code</option>
              {itemCodes.map((item) => (
                <option key={item.ItemCode} value={item.ItemCode}>
                  {item.ItemCode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="ie-row">
          <div className="ie-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
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

        {/* ROW 3 */}
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