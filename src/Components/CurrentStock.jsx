import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/CurrentStock.css";
import api from "../api";

function CurrentStock() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation(); // Detect navigation with state

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await api.get("/currentstock/getCurrentStock");

      if (res.data.status === 1 && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((item) => ({
          id: item.StockID,
          itemID: item.ItemID,
          itemName: item.ItemName,
          itemCode: item.ItemCode,
          category: item.CategoryName || "-",
          uom: item.UOMName || "-",
          quantity: item.AvailableQty,
          created: "-", 
          updated: item.LastUpdated ? new Date(item.LastUpdated).toLocaleString() : "-",
        }));

        setStockList(formatted);
      } else {
        setStockList([]);
      }
    } catch (err) {
      console.error("Error fetching current stock:", err);
      setStockList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // If navigated with refresh state, refetch
  useEffect(() => {
    if (location.state?.refresh) {
      fetchStock();
    }
  }, [location.state]);

  const handleDelete = (index) => {
    const data = stockList.filter((_, i) => i !== index);
    setStockList(data);
  };

  return (
    <div className="cs-page">
      <Sidebar />
      <Topbar />

      <div className="cs-header">
        <div>
          <h1>Current Stock</h1>
          <p>Real-time inventory levels</p>
        </div>
      </div>

      <div className="cs-table-card">
        {loading ? (
          <p>Loading stock data...</p>
        ) : (
          <table className="cs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Category</th>
                <th>UOM</th>
                <th>Quantity</th>
                <th>Action</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>

            <tbody>
              {stockList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="cs-empty">No Stock Available</td>
                </tr>
              ) : (
                stockList.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.itemName}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.category}</td>
                    <td>{item.uom}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button className="cs-delete-btn" onClick={() => handleDelete(index)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                    <td>{item.created}</td>
                    <td>{item.updated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CurrentStock;