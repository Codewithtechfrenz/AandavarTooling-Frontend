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
  const [uoms, setUoms] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");

  /* LOAD DATA */
  useEffect(() => {
    loadProducts();
    loadUoms();
  }, []);

  /* FETCH PRODUCTS */
  const loadProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");

      console.log("Products API Response:", res);

      let list = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res.data.status === 1 && Array.isArray(res.data.data)) {
        list = res.data.data;
      }

      setProducts(list);
    } catch (error) {
      console.error("Product API Error:", error);
      setProducts([]);
    }
  };

  /* FETCH UOMS */
  const loadUoms = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");

      console.log("UOM API Response:", res);

      let list = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.data)) {
        list = res.data.data;
      } else if (res.data.status === 1 && Array.isArray(res.data.data)) {
        list = res.data.data;
      }

      setUoms(list);
    } catch (error) {
      console.error("UOM API Error:", error);
      setUoms([]);
    }
  };

  /* ITEM NAME CHANGE */
  const handleItemChange = (e) => {
    const id = e.target.value;

    const item = products.find(
      (p) => String(p.ItemID) === String(id)
    );

    if (item) {
      setSelectedItem(item);
      setItemCode(item.ItemCode);
    }
  };

  /* ITEM CODE CHANGE */
  const handleCodeChange = (e) => {
    const code = e.target.value;

    const item = products.find(
      (p) => p.ItemCode === code
    );

    if (item) {
      setSelectedItem(item);
      setItemCode(item.ItemCode);
    }
  };

  /* SUBMIT */
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

        <div className="ie-row">

          <div className="ie-group">
            <label>Item Name</label>


            
            <select
              value={selectedItem?.ItemID || ""}
              onChange={handleItemChange}
            >
              <option value="">Select Item</option>
              {products.length > 0 ? (
                products.map((item) => (
                  <option key={item.ItemID} value={item.ItemID}>
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
            <select value={itemCode} onChange={handleCodeChange}>
              <option value="">Select Code</option>
              {products.length > 0 ? (
                products.map((item) => (
                  <option key={item.ItemCode} value={item.ItemCode}>
                    {item.ItemCode}
                  </option>
                ))
              ) : (
                <option disabled>No Codes Found</option>
              )}
            </select>
          </div>

        </div>

        <div className="ie-row">

          <div className="ie-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="">Select UOM</option>
              {uoms.length > 0 ? (
                uoms.map((u, i) => (
                  <option key={i} value={u.UOMName || u}>
                    {u.UOMName || u}
                  </option>
                ))
              ) : (
                <option disabled>No UOM Found</option>
              )}
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