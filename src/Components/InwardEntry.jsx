import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api";

function InwardEntry() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [uoms, setUoms] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
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

      console.log("PRODUCT API RESPONSE:", res.data);

      let list = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (Array.isArray(res.data.items)) {
        list = res.data.items;
      }

      setProducts(list);
    } catch (error) {
      console.error("Product fetch error:", error);
      setProducts([]);
    }
  };

  /* ================= FETCH UOM ================= */
  const fetchUOMs = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");

      let list = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.data)) {
        list = res.data.data;
      }

      setUoms(list);
    } catch (error) {
      console.error("UOM fetch error:", error);
      setUoms([]);
    }
  };

  /* ================= SELECT BY ITEM NAME ================= */
  const handleItemNameChange = (e) => {
    const id = e.target.value;
    const item = products.find(
      (p) => String(p.ItemID) === String(id)
    );
    setSelectedItem(item || null);
  };

  /* ================= SELECT BY ITEM CODE ================= */
  const handleItemCodeChange = (e) => {
    const code = e.target.value;
    const item = products.find(
      (p) => p.ItemCode === code
    );
    setSelectedItem(item || null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!selectedItem || !qty || !rate || !uom) {
      alert("Please enter all fields");
      return;
    }

    try {
      const payload = {
        ItemID: selectedItem.ItemID,
        ItemName: selectedItem.ItemName,
        ItemCode: selectedItem.ItemCode,
        UOMName: uom,
        Quantity: Number(qty),
        Rate: Number(rate),
        Status: "Completed",
      };

      const res = await api.post("/inward/iteminward", payload);

      alert(res.data.message || "Saved successfully");

      setSelectedItem(null);
      setUom("");
      setQty("");
      setRate("");

      navigate("/current-stock", { state: { refresh: true } });

    } catch (error) {
      console.error(error);
      alert("Error saving inward");
    }
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
            <select
              value={selectedItem?.ItemID || ""}
              onChange={handleItemNameChange}
            >
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
            <select
              value={selectedItem?.ItemCode || ""}
              onChange={handleItemCodeChange}
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

          <div className="ie-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="">Select UOM</option>
              {uoms.map((u, i) => (
                <option key={i} value={u.UOMName || u}>
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