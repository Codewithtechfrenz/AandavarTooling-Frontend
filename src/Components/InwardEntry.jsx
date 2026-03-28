import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api";

function InwardEntry() {
  const navigate = useNavigate();

  const [itemID, setItemID] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
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

  /* ================= HANDLE ITEM NAME SELECT ================= */
  const handleItemNameChange = (e) => {
    const selectedId = e.target.value;

    const selectedItem = itemOptions.find(
      (item) =>
        item.ItemID == selectedId ||
        item.item_id == selectedId
    );

    setItemID(selectedItem?.ItemID || selectedItem?.item_id || "");
    setItemName(selectedItem?.ItemName || selectedItem?.item_name || "");
    setItemCode(selectedItem?.ItemCode || selectedItem?.item_code || "");
  };

  /* ================= HANDLE ITEM CODE SELECT ================= */
  const handleItemCodeChange = (e) => {
    const selectedCode = e.target.value;

    const selectedItem = itemOptions.find(
      (item) =>
        item.ItemCode === selectedCode ||
        item.item_code === selectedCode
    );

    setItemID(selectedItem?.ItemID || selectedItem?.item_id || "");
    setItemName(selectedItem?.ItemName || selectedItem?.item_name || "");
    setItemCode(selectedItem?.ItemCode || selectedItem?.item_code || "");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!itemID || !itemQty || !rate || !uom) {
      alert("Enter all fields");
      return;
    }

    try {
      const payload = {
        ItemID: itemID,
        ItemName: itemName,
        ItemCode: itemCode,
        UOMName: uom,
        Quantity: Number(itemQty),
        Rate: Number(rate),
        Status: "Completed",
      };

      const res = await api.post("/inward/iteminward", payload);

      alert(res.data.message || "Inward submitted & stock updated!");

      // Clear form
      setItemID("");
      setItemName("");
      setItemCode("");
      setUom("");
      setItemQty("");
      setRate("");

      // Redirect to stock page
      navigate("/current-stock", { state: { refresh: true } });

    } catch (err) {
      console.error(err);
      alert("Error updating stock");
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
        {/* ===== ROW 1 ===== */}
        <div className="ie-row">
          {/* Item Name */}
          <div className="ie-group">
            <label>Item Name</label>
            <select value={itemID} onChange={handleItemNameChange}>
              <option value="">Select Item</option>
              {itemOptions.map((item, i) => (
                <option key={i} value={item.ItemID || item.item_id}>
                  {item.ItemName || item.item_name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Code */}
          <div className="ie-group">
            <label>Item Code</label>
            <select value={itemCode} onChange={handleItemCodeChange}>
              <option value="">Select Code</option>
              {itemOptions.map((item, i) => (
                <option key={i} value={item.ItemCode || item.item_code}>
                  {item.ItemCode || item.item_code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== ROW 2 ===== */}
        <div className="ie-row">
          {/* UOM */}
          <div className="ie-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.length > 0 ? (
                uomOptions.map((u, i) => (
                  <option key={i} value={u.UOMName || u}>
                    {u.UOMName || u}
                  </option>
                ))
              ) : (
                <option disabled>No UOM Found</option>
              )}
            </select>
          </div>

          {/* Quantity */}
          <div className="ie-group">
            <label>Quantity</label>
            <input
              type="number"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
            />
          </div>
        </div>

        {/* ===== ROW 3 ===== */}
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