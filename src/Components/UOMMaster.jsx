import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ use base API
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/UOMMaster.css";

function UOMMaster() {
  const [uomCode, setUomCode] = useState("");
  const [uomName, setUomName] = useState("");
  const [uomList, setUomList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [selectedSI, setSelectedSI] = useState(null);

  /* ================= LOAD DATA ================= */
  const fetchUOMs = async () => {
    try {
      const res = await api.get("/uom/getUOMs"); // ✅ use api
      const data = res.data.data || [];

      const formattedData = data.map((item, index) => ({
        id: index + 1,
        SI: item.SI,
        code: item.UOMCode,
        name: item.UOMName,
        created: item.created_at || "-",
        updated: item.updated_at || "-",
      }));

      setUomList(formattedData);
      localStorage.setItem("uomData", JSON.stringify(formattedData));
    } catch (err) {
      console.error("Fetch UOM API error:", err);
      const stored = localStorage.getItem("uomData");
      if (stored) setUomList(JSON.parse(stored) || []);
    }
  };

  useEffect(() => {
    fetchUOMs();
  }, []);

  /* ================= UPDATE LOCAL STORAGE ================= */
  const updateStorage = (data) => {
    localStorage.setItem("uomData", JSON.stringify(data));
    setUomList(data);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!uomCode || !uomName) {
      alert("Enter UOM Code and Name");
      return;
    }

    let data = [...uomList];

    if (editIndex !== null && selectedSI) {
      /* UPDATE */
      try {
        const res = await api.post("/uom/updateUOM", {
          SI: selectedSI,
          UOMCode: uomCode,
          UOMName: uomName,
        });

        if (res.data.status === 0) throw new Error(res.data.message || "Update Failed");

        alert("UOM updated successfully");

        data = data.map((item) =>
          item.SI === selectedSI
            ? { ...item, code: uomCode, name: uomName, updated: new Date().toLocaleString() }
            : item
        );

        setEditIndex(null);
        setSelectedSI(null);
      } catch (error) {
        console.error("Update API Error:", error);
        alert("Failed to update UOM on server");
        return;
      }
    } else {
      /* CREATE */
      try {
        const res = await api.post("/uom/createUOM", {
          UOMCode: uomCode,
          UOMName: uomName,
        });

        if (res.data.status === 0) throw new Error(res.data.message || "Create Failed");

        alert("UOM created successfully");

        data.push({
          id: data.length + 1,
          code: uomCode,
          name: uomName,
          created: new Date().toLocaleString(),
          updated: "-",
        });
      } catch (error) {
        console.error("Create API Error:", error);
        alert("Failed to save UOM on server");
        return;
      }
    }

    updateStorage(data);

    setUomCode("");
    setUomName("");
  };

  /* ================= EDIT ================= */
  const handleEdit = (index) => {
    const item = filteredData[index];
    if (!item) return;

    setUomCode(item.code);
    setUomName(item.name);
    setSelectedSI(item.SI);
    setEditIndex(index);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (index) => {
    const item = filteredData[index];
    if (!item || !item.SI) {
      alert("Invalid UOM selected");
      return;
    }

    try {
      const res = await api.post("/uom/deleteUOM", { SI: item.SI });

      if (res.data.status === 0) throw new Error(res.data.message || "Delete Failed");

      alert("UOM deleted successfully");

      const data = uomList.filter((u) => u.SI !== item.SI).map((item, i) => ({
        ...item,
        id: i + 1,
      }));

      updateStorage(data);
    } catch (error) {
      console.error("Delete API Error:", error);
      alert("Failed to delete UOM from server");
    }
  };

  /* ================= SEARCH ================= */
  const filteredData = uomList.filter(
    (item) =>
      (item.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="uom-master-page">
      <Sidebar />
      <Topbar />

      <div className="uom-master-header">
        <h1>UOM Master</h1>
        <p>Manage unit of measurements</p>
      </div>

      <div className="uom-master-form">
        <div className="form-row">
          <div className="form-group">
            <label>UOM Code</label>
            <input type="text" value={uomCode} onChange={(e) => setUomCode(e.target.value)} />
          </div>

          <div className="form-group">
            <label>UOM Name</label>
            <input type="text" value={uomName} onChange={(e) => setUomName(e.target.value)} />
          </div>
        </div>

        <button className="uom-master-btn" onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="uom-master-search">
        <i className="fa fa-search"></i>
        <input
          type="text"
          placeholder="Search UOM..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="uom-master-table-card">
        <table className="uom-master-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>UOM Code</th>
              <th>UOM Name</th>
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="uom-master-empty">
                  No UOM Found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>
                    <button className="uom-master-edit" onClick={() => handleEdit(index)}>
                      <i className="fa fa-edit"></i>
                    </button>
                    <button className="uom-master-delete" onClick={() => handleDelete(index)}>
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
      </div>
    </div>
  );
}

export default UOMMaster;