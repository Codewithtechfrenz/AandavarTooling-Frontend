import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api";

function InwardEntry() {
  const navigate = useNavigate();

  /* ================= STATES ================= */
  const [products, setProducts] = useState([]);
  const [uoms, setUoms] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchProducts();
    fetchUOMs();
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");

      console.log("Products API:", res.data);

      if (res.data.status === 1) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      setProducts([]);
    }
  };

  /* ================= FETCH UOMS ================= */
  const fetchUOMs = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");

      if (res.data.status === 1) {
        setUoms(res.data.data);
      } else {
        setUoms([]);
      }
    } catch (err) {
      console.error("UOM fetch error:", err);
      setUoms([]);
    }
  };

  /* ================= SELECT ITEM NAME ================= */
  const handleItemChange = (e) => {
    const id = e.target.value;

    const item = products.find(
      (p) => String(p.ItemID) === String(id)
    );

    if (item) {
      setSelectedItem(item);
      setItemCode(item.ItemCode);
    } else {
      setSelectedItem(null);
      setItemCode("");
    }
  };

  /* ================= SELECT ITEM CODE ================= */
  const handleCodeChange = (e) => {
    const code = e.target.value;

    const item = products.find(
      (p) => p.ItemCode === code
    );

    if (item) {
      setSelectedItem(item);
      setItemCode(item.ItemCode);
    } else {
      setSelectedItem(null);
      setItemCode("");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedItem || !qty || !rate || !uom) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      ItemID: selectedItem.ItemID,
      ItemName: selectedItem.ItemName,
      ItemCode: selectedItem.ItemCode,
      UOMName: uom,
      Quantity: Number(qty),
      Rate: Number(rate),
      Status: "Completed",
    };

    try {
      const res = await api.post("/inward/iteminward", payload);

      alert(res.data.message || "Inward saved successfully");

      clearForm();

      navigate("/current-stock", { state: { refresh: true } });
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error saving inward");
    }
  };

  /* ================= CLEAR FORM ================= */
  const clearForm = () => {
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

          {/* ITEM NAME */}
          <div className="ie-group">
            <label>Item Name</label>
            <select
              value={selectedItem?.ItemID || ""}
              onChange={handleItemChange}
            >
              <option value="">Select Item</option>
              {products.map((item) => (
                <option key={item.ItemID} value={item.ItemID}>
                  {item.ItemName}
                </option>
              ))}
            </select>
          </div>

          {/* ITEM CODE */}
          <div className="ie-group">
            <label>Item Code</label>
            <select
              value={itemCode}
              onChange={handleCodeChange}
            >
              <option value="">Select Code</option>
              {products.map((item) => (
                <option key={item.ItemCode} value={item.ItemCode}>
                  {item.ItemCode}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ROW 2 */}
        <div className="ie-row">

          {/* UOM */}
          <div className="ie-group">
            <label>UOM</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value)}
            >
              <option value="">Select UOM</option>
              {uoms.map((u, i) => (
                <option key={i} value={u.UOMName || u}>
                  {u.UOMName || u}
                </option>
              ))}
            </select>
          </div>

          {/* QUANTITY */}
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

        {/* SUBMIT BUTTON */}
        <button className="ie-btn" onClick={handleSubmit}>
          Submit
        </button>

      </div>
    </div>
  );
}

export default InwardEntry;