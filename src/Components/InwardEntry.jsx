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
  const [loading, setLoading] = useState(true);

  const [selectedItemName, setSelectedItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* ─── BULLETPROOF DATA EXTRACTOR ─────────────────────────────────────────
     Tries every known response shape and returns a plain array.
     Handles: res.data=[...], res.data.data=[...],
              res.data.items=[...], res.data.result=[...], etc.
  ─────────────────────────────────────────────────────────────────────────── */
  const extractList = (res) => {
    const d = res?.data;

    // Shape 1: res.data is already an array
    if (Array.isArray(d)) return d;

    if (d && typeof d === "object") {
      // Shape 2: common key names
      const commonKeys = ["data", "items", "result", "results", "list", "records", "products"];
      for (const key of commonKeys) {
        if (Array.isArray(d[key])) return d[key];
      }

      // Shape 3: any top-level value that is an array
      const anyArray = Object.values(d).find((v) => Array.isArray(v));
      if (anyArray) return anyArray;

      // Shape 4: nested inside res.data.data object
      if (d.data && typeof d.data === "object") {
        const nested = Object.values(d.data).find((v) => Array.isArray(v));
        if (nested) return nested;
      }
    }

    return [];
  };

  /* ─── NORMALIZE a single item → { ItemName, ItemCode } ─────────────────── */
  const normalizeItem = (item) => {
    if (!item || typeof item === "string") return null;

    const name = String(
      item.ItemName   ??
      item.itemName   ??
      item.item_name  ??
      item.ITEMNAME   ??
      item.name       ??
      ""
    ).trim();

    const code = String(
      item.ItemCode   ??
      item.itemCode   ??
      item.item_code  ??
      item.ITEMCODE   ??
      item.code       ??
      ""
    ).trim();

    if (!name || !code) return null;
    return { ItemName: name, ItemCode: code };
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadUoms()]);
    setLoading(false);
  };

  /* ─── LOAD PRODUCTS ──────────────────────────────────────────────────────── */
  const loadProducts = async () => {
    try {
      const res = await api.get("/items/activeitem");

      // ── Full response log: open browser console to see exact shape ──
      console.log("=== PRODUCTS RAW RESPONSE ===", JSON.stringify(res?.data));

      const list = extractList(res);
      console.log("=== EXTRACTED LIST ===", list);

      const normalized = list.map(normalizeItem).filter(Boolean);
      console.log("=== NORMALIZED PRODUCTS ===", normalized);

      setProducts(normalized);
    } catch (err) {
      console.error("Product Load Error:", err);
      setProducts([]);
    }
  };

  /* ─── LOAD UOMs ──────────────────────────────────────────────────────────── */
  const loadUoms = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");
      setUoms(extractList(res));
    } catch {
      setUoms([]);
    }
  };

  /* ─── HANDLERS ───────────────────────────────────────────────────────────── */
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
      alert(res.data.message || "Saved");
      resetForm();
      navigate("/current-stock", { state: { refresh: true } });
    } catch (err) {
      console.error(err);
      alert("Error saving");
    }
  };

  const resetForm = () => {
    setSelectedItemName("");
    setItemCode("");
    setUom("");
    setQty("");
    setRate("");
  };

  /* ─── RENDER ─────────────────────────────────────────────────────────────── */
  return (
    <div className="ie-page">
      <Sidebar />
      <Topbar />

      <div className="ie-header">
        <h1>Product Inward Entry</h1>
      </div>

      <div className="ie-form">
        <div className="ie-row">

          {/* ── ITEM NAME ── */}
          <div className="ie-group">
            <label>Item Name</label>
            <select
              value={selectedItemName}
              onChange={handleItemChange}
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select Item"}
              </option>
              {products.map((item, index) => (
                <option key={item.ItemCode + "_" + index} value={item.ItemName}>
                  {item.ItemName}
                </option>
              ))}
              {!loading && products.length === 0 && (
                <option disabled>No Items Found</option>
              )}
            </select>
          </div>

          {/* ── ITEM CODE ── */}
          <div className="ie-group">
            <label>Item Code</label>
            <select
              value={itemCode}
              onChange={handleCodeChange}
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select Code"}
              </option>
              {products.map((item, index) => (
                <option key={item.ItemCode + "_c_" + index} value={item.ItemCode}>
                  {item.ItemCode}
                </option>
              ))}
              {!loading && products.length === 0 && (
                <option disabled>No Codes Found</option>
              )}
            </select>
          </div>

        </div>

        <div className="ie-row">

          {/* ── UOM ── */}
          <div className="ie-group">
            <label>UOM</label>
            <select
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select UOM"}
              </option>
              {uoms.map((u, i) => (
                <option key={i} value={u.UOMName || u}>
                  {u.UOMName || u}
                </option>
              ))}
            </select>
          </div>

          {/* ── QUANTITY ── */}
          <div className="ie-group">
            <label>Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

        </div>

        <div className="ie-row">

          {/* ── RATE ── */}
          <div className="ie-group">
            <label>Rate</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>

        </div>

        <button className="ie-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default InwardEntry;
