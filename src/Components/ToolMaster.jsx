import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ use base API

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

import "../CSS/ToolMasters.css";

function ToolMaster() {
  const [toolName, setToolName] = useState("");
  const [toolCode, setToolCode] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [uom, setUom] = useState("");
  const [minStock, setMinStock] = useState("");

  const [uomOptions, setUomOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [productList, setProductList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSI, setSelectedSI] = useState(null);

  /* ================= LOAD FROM DB ================= */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/tool/getTools"); // ✅ use api
      const data = res.data.data;

      if (!Array.isArray(data)) return;

      const formatted = data.map((item) => ({
        id: item.SI,
        SI: item.SI,
        toolName: item.ToolName,
        toolCode: item.ToolCode,
        category: item.CategoryName,
        minStock: item.MinStock,
        uom: item.UOMName,
        status: item.Status,
        created: item.CreatedDate
          ? new Date(item.CreatedDate).toLocaleString()
          : "-",
        updated: item.UpdatedDate
          ? new Date(item.UpdatedDate).toLocaleString()
          : "-",
      }));

      formatted.sort((a, b) => a.SI - b.SI);
      setProductList(formatted);
    } catch (error) {
      toast.error("Failed to fetch tools");
    }
  };

  /* ================= LOAD UOM ================= */
  const fetchUOMOptions = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM"); // ✅ use api
      if (res.data.data) setUomOptions(res.data.data);
    } catch {
      toast.error("Failed to fetch UOM options");
    }
  };

  /* ================= LOAD CATEGORY ================= */
  const fetchCategoryOptions = async () => {
    try {
      const res = await api.get("/activecategories/activeCategorie"); // ✅ use api
      if (res.data.data) setCategoryOptions(res.data.data);
    } catch {
      toast.error("Failed to fetch Category options");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUOMOptions();
    fetchCategoryOptions();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!toolName || !toolCode) {
      toast.warning("Enter Tool Name and Code");
      return;
    }

    try {
      const payload = {
        SI: selectedSI,
        ToolName: toolName,
        ToolCode: toolCode,
        CategoryName: category || "",
        MinStock: Number(minStock) || 0,
        UOMName: uom || "",
        Status: status || "Active",
      };

      const endpoint =
        editIndex !== null && selectedSI ? "/tool/updateTool" : "/tool/createtool";

      const res = await api.post(endpoint, payload); // ✅ use api

      if (res.data.status === 1) {
        toast.success(
          editIndex !== null ? "Tool Updated Successfully" : "Tool Created Successfully"
        );
      } else {
        toast.error(res.data?.message || "Operation Failed");
      }

      fetchProducts();
    } catch {
      toast.error("API Error");
    }

    // Reset form
    setToolName("");
    setToolCode("");
    setCategory("");
    setStatus("");
    setUom("");
    setMinStock("");
    setEditIndex(null);
    setSelectedSI(null);
  };

  /* ================= EDIT ================= */
  const handleEdit = (index) => {
    const item = filteredData[index];
    setToolName(item.toolName);
    setToolCode(item.toolCode);
    setCategory(item.category);
    setStatus(item.status);
    setUom(item.uom);
    setMinStock(item.minStock);
    setSelectedSI(item.SI);
    setEditIndex(index);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (index) => {
    const item = filteredData[index];
    if (!window.confirm("Are you sure to delete?")) return;

    try {
      const res = await api.post("/tool/deleteTool", { SI: item.SI }); // ✅ use api
      if (res.data.status === 1) {
        toast.success("Tool Deleted Successfully");
        fetchProducts();
      } else {
        toast.error("Delete Failed");
      }
    } catch {
      toast.error("Delete Failed");
    }
  };

  /* ================= SEARCH ================= */
  const filteredData = productList.filter(
    (item) =>
      item.toolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.toolCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-page">
      <Sidebar />
      <Topbar />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="product-header">
        <div>
          <h1>Tool Master</h1>
          <p>Manage tools and stock levels</p>
        </div>
      </div>

      <div className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tool Name</label>
            <input value={toolName} onChange={(e) => setToolName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tool Code</label>
            <input value={toolCode} onChange={(e) => setToolCode(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {categoryOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Select Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>UOM</label>
            <select value={uom} onChange={(e) => setUom(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Min-Stock</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
          </div>
        </div>

        <button className="add-btn" onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="product-search">
        <input
          type="text"
          placeholder="Search tool..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tool Name</th>
              <th>Tool Code</th>
              <th>Category</th>
              <th>MinStock</th>
              <th>Status</th>
              <th>UOM</th>
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="10">No Tool Found</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.toolName}</td>
                  <td>{item.toolCode}</td>
                  <td>{item.category}</td>
                  <td>{item.minStock}</td>
                  <td>{item.status}</td>
                  <td>{item.uom}</td>
                  <td>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                  <td>{item.created}</td>
                  <td>{item.updated}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ToolMaster;