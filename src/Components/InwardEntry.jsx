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

  const [selectedItemName, setSelectedItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* SAFE DATA EXTRACTOR */
  const extractList = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;

    if (res?.data?.data) {
      const nested = Object.values(res.data.data).find((v) =>
        Array.isArray(v)
      );
      if (nested) return nested;
    }

    // FIX: handle flat object with array values at top level
    if (res?.data && typeof res.data === "object") {
      const nested = Object.values(res.data).find((v) => Array.isArray(v));
      if (nested) return nested;
    }

    return [];
  };

  useEffect(() => {
    loadProducts();
    loadUoms();
    // FIX: Removed loadItemCodes() — Item Code dropdown now uses `products`
    // so both dropdowns stay in sync and no separate fetch is needed.
  }, []);

  /* PRODUCTS */
  const loadProducts = async () => {
    try {
      const res = await api.get("/items/activeitem");

      const list = extractList(res);

      console.log("Raw list from API:", list); // debug

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

      console.log("Normalized Products:", normalized); // debug

      setProducts(normalized);
    } catch (err) {
      console.error("Product Load Error:", err);
      setProducts([]);
    }
  };

  // FIX: Removed loadItemCodes() — was fetching a separate endpoint that
  // returned data in a different shape, causing itemCodes to be a list of
  // raw strings/objects that didn't match `products`, so find() always
  // returned undefined and selectedItemName was never set.

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

  return (
    <div className="ie-page">
      <Sidebar />
      <Topbar />

      <div className="ie-header">
        <h1>Product Inward Entry</h1>
      </div>

      <div className="ie-form">
        <div className="ie-row">
          <div className="ie-group">
            <label>Item Name</label>
            {/* FIX: Dropdown now renders from `products` which is the single
                source of truth — guaranteed to be normalized & non-empty */}
            <select value={selectedItemName} onChange={handleItemChange}>
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

          <div className="ie-group">
            <label>Item Code</label>
            {/* FIX: Now uses `products` instead of separate `itemCodes` state.
                This ensures selecting a code auto-fills Item Name correctly. */}
            <select value={itemCode} onChange={handleCodeChange}>
              <option value="">Select Code</option>
              {products.map((item, i) => (
                <option key={item.ItemCode + i} value={item.ItemCode}>
                  {item.ItemCode}
                </option>
              ))}
            </select>
          </div>
        </div>

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
