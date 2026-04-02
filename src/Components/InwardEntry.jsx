import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/InwardEntry.css";
import api from "../api";

function InwardEntry() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [itemCodes, setItemCodes] = useState([]);
  const [uoms, setUoms] = useState([]);

  const [selectedItemName, setSelectedItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* SAFE EXTRACT */
  const extractList = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;

    if (res?.data?.data) {
      const nested = Object.values(res.data.data).find((v) =>
        Array.isArray(v)
      );
      if (nested) return nested;
    }
    return [];
  };

  useEffect(() => {
    loadProducts();
    loadItemCodes();
    loadUoms();
  }, []);

  /* PRODUCTS */
  const loadProducts = async () => {
    try {
      const res = await api.get("/items/activeitem");

      const list = extractList(res);

      const normalized = list
        .map((item) => ({
          ItemName: String(
            item.ItemName ||
              item.itemName ||
              item.item_name ||
              ""
          ).trim(),
          ItemCode: String(
            item.ItemCode ||
              item.itemCode ||
              item.item_code ||
              ""
          ).trim(),
        }))
        .filter((i) => i.ItemName && i.ItemCode);

      console.log("PRODUCTS:", normalized);

      setProducts(normalized);
    } catch (err) {
      console.error("Product Load Error:", err);
      setProducts([]);
    }
  };

  const loadItemCodes = async () => {
    try {
      const res = await api.get("/activeitems/activeitemcode");
      setItemCodes(extractList(res));
    } catch {
      setItemCodes([]);
    }
  };

  const loadUoms = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");
      setUoms(extractList(res));
    } catch {
      setUoms([]);
    }
  };

  /* HANDLERS */
  const handleItemChange = (e) => {
    const name = e.target.value;
    setSelectedItemName(name);

    const found = products.find((p) => p.ItemName === name);
    setItemCode(found ? found.ItemCode : "");
  };

  const handleCodeChange = (e) => {
    const code = e.target.value;
    setItemCode(code);

    const found = products.find((p) => p.ItemCode === code);
    setSelectedItemName(found ? found.ItemName : "");
  };

  const resetForm = () => {
    setSelectedItemName("");
    setItemCode("");
    setUom("");
    setQty("");
    setRate("");
  };

  const handleSubmit = async () => {
    if (!selectedItemName || !itemCode || !uom || !qty || !rate) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      ItemName: selectedItemName,
      ItemCode: itemCode,
      UOMName: uom,
      Quantity: Number(qty),
      Rate: Number(rate),
      Status: "Completed",
    };

    try {
      const res = await api.post("/inward/iteminward", payload);
      alert(res.data.message || "Saved Successfully");

      resetForm();
      navigate("/current-stock", { state: { refresh: true } });
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving inward entry");
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
        <div className="ie-row">
          {/* ITEM NAME */}
          <div className="ie-group">
            <label>Item Name</label>
            <select
              value={selectedItemName}
              onChange={handleItemChange}
              className="ie-select"
            >
              <option value="">Select Item</option>

              {products.length > 0 ? (
                products.map((item, index) => (
                  <option
                    key={item.ItemCode + index}
                    value={item.ItemName}
                  >
                    {item.ItemName}
                  </option>
                ))
              ) : (
                <option disabled>No Items Found</option>
              )}
            </select>
          </div>

          {/* ITEM CODE */}
          <div className="ie-group">
            <label>Item Code</label>
            <select value={itemCode} onChange={handleCodeChange}>
              <option value="">Select Code</option>
              {itemCodes.map((code, i) => (
                <option key={i} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* UOM + QTY */}
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