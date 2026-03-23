import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/LineReturn.css";

function LineReturn() {
  const [itemName, setItemName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [uom, setUom] = useState("");
  const [category, setCategory] = useState("");
  const [inQty, setInQty] = useState("");
  const [damageQty, setDamageQty] = useState("");
  const [worker, setWorker] = useState("");
  const [machine, setMachine] = useState("");

  const [lineReturnList, setLineReturnList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [uomOptions, setUomOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // ✅ NEW STATES
  const [itemOptions, setItemOptions] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const stored = localStorage.getItem("lineReturnData");
    if (stored) setLineReturnList(JSON.parse(stored));
    else localStorage.setItem("lineReturnData", JSON.stringify([]));

    fetchUOMOptions();
    fetchCategoryOptions();

    // ✅ NEW API CALLS
    fetchItemOptions();
    fetchWorkerOptions();
    fetchMachineOptions();
  }, []);

  /* ================= FETCH UOM ================= */
  const fetchUOMOptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/activeuoms/activeUOM"
      );
      if (res.status === 200 && res.data.data) {
        setUomOptions(res.data.data);
      }
    } catch (err) {
      console.error("UOM API Error:", err?.response || err);
      alert("Failed to fetch UOM options");
    }
  };

  /* ================= FETCH CATEGORY ================= */
  const fetchCategoryOptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/activecategories/activeCategorie"
      );
      if (res.status === 200 && res.data.data) {
        setCategoryOptions(res.data.data);
      }
    } catch (err) {
      console.error("CATEGORY API Error:", err?.response || err);
      alert("Failed to fetch Category options");
    }
  };

  /* ================= NEW APIs ================= */

  const fetchItemOptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/activeitems/activeitem"
      );
      if (res.status === 200 && res.data.data) {
        setItemOptions(res.data.data);
      }
    } catch (err) {
      console.error("ITEM API Error:", err?.response || err);
      alert("Failed to fetch Item options");
    }
  };

  const fetchWorkerOptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/activeworkers/activeworker"
      );
      if (res.status === 200 && res.data.data) {
        setWorkerOptions(res.data.data);
      }
    } catch (err) {
      console.error("WORKER API Error:", err?.response || err);
      alert("Failed to fetch Worker options");
    }
  };

  const fetchMachineOptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8001/activemachines/activemachine"
      );
      if (res.status === 200 && res.data.data) {
        setMachineOptions(res.data.data);
      }
    } catch (err) {
      console.error("MACHINE API Error:", err?.response || err);
      alert("Failed to fetch Machine options");
    }
  };

  /* ================= SAVE STORAGE ================= */
  const updateStorage = (data) => {
    localStorage.setItem("lineReturnData", JSON.stringify(data));
    setLineReturnList(data);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!itemName || !inQty || !uom) {
      alert("Enter Item Name, Quantity, and select UOM");
      return;
    }

    let data = [...lineReturnList];

    if (editIndex !== null) {
      data[editIndex] = {
        ...data[editIndex],
        itemName,
        itemCode,
        uom,
        category,
        inQty,
        damageQty,
        worker,
        machine,
        updated: new Date().toLocaleString(),
      };
      setEditIndex(null);
    } else {
      data.push({
        id: data.length + 1,
        itemName,
        itemCode,
        uom,
        category,
        inQty,
        damageQty,
        worker,
        machine,
        created: new Date().toLocaleString(),
        updated: "-",
      });
    }

    updateStorage(data);

    try {
      const payload = {
        ItemName: itemName,
        UOMName: uom,
        Quantity: Number(inQty),
        Rate: 0,
        Status: "Completed",
        WorkerName: worker,
        MachineName: machine,
        Description: "Received from supplier",
      };

      await axios.post(
        "http://localhost:8001/linefeedin/linefeedins",
        payload
      );

      alert("Line Return submitted and stock updated!");
    } catch (err) {
      console.error(err);
      alert("API Error while updating stock!");
    }

    setItemName("");
    setItemCode("");
    setUom("");
    setCategory("");
    setInQty("");
    setDamageQty("");
    setWorker("");
    setMachine("");
  };

  /* ================= EDIT ================= */
  const handleEdit = (index) => {
    const item = lineReturnList[index];
    setItemName(item.itemName);
    setItemCode(item.itemCode);
    setUom(item.uom);
    setCategory(item.category);
    setInQty(item.inQty);
    setDamageQty(item.damageQty);
    setWorker(item.worker);
    setMachine(item.machine);
    setEditIndex(index);
  };

  /* ================= DELETE ================= */
  const handleDelete = (index) => {
    const data = lineReturnList
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, id: i + 1 }));
    updateStorage(data);
  };

  /* ================= SEARCH ================= */
  const filteredData = lineReturnList.filter(
    (item) =>
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.worker?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lr-page">
      <Sidebar />
      <Topbar />

      <div className="lr-header">
        <div>
          <h1>Line Return</h1>
          <p>Record material returns to inventory</p>
        </div>
      </div>

      <div className="lr-form">
        <div className="lr-row">
          {/* ✅ ITEM DROPDOWN */}
          <div className="lr-group">
            <label>Item Name</label>
            <select
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            >
              <option value="">Select Item</option>
              {itemOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="lr-group">
            <label>Item Code</label>
            <input
              type="text"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
            />
          </div>
        </div>

        <div className="lr-row">
          <div className="lr-group">
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

          <div className="lr-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categoryOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lr-row">
          <div className="lr-group">
            <label>In Quantity</label>
            <input
              type="number"
              value={inQty}
              onChange={(e) => setInQty(e.target.value)}
            />
          </div>

          <div className="lr-group">
            <label>Damage Quantity</label>
            <input
              type="number"
              value={damageQty}
              onChange={(e) => setDamageQty(e.target.value)}
            />
          </div>
        </div>

        <div className="lr-row">
          {/* ✅ WORKER DROPDOWN */}
          <div className="lr-group">
            <label>Worker</label>
            <select
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
            >
              <option value="">Select Worker</option>
              {workerOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ MACHINE DROPDOWN */}
          <div className="lr-group">
            <label>Machine</label>
            <select
              value={machine}
              onChange={(e) => setMachine(e.target.value)}
            >
              <option value="">Select Machine</option>
              {machineOptions.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="lr-btn" onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="lr-search">
        <input
          type="text"
          placeholder="Search line return..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="lr-table-card">
        <table className="lr-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>UOM</th>
              <th>Category</th>
              <th>In Quantity</th>
              <th>Damage Quantity</th>
              <th>Worker</th>
              <th>Machine</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="10">No Line Return Found</td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.itemName}</td>
                  <td>{item.itemCode}</td>
                  <td>{item.uom}</td>
                  <td>{item.category}</td>
                  <td>{item.inQty}</td>
                  <td>{item.damageQty}</td>
                  <td>{item.worker}</td>
                  <td>{item.machine}</td>
                  <td>{item.created}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LineReturn;