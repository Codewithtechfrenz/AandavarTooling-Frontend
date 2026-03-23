import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ USE BASE API

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/MachineMaster.css";

function MachineMaster() {

  const [machineCode,setMachineCode]=useState("");
  const [machineName,setMachineName]=useState("");
  const [department,setDepartment]=useState("");

  const [machineList,setMachineList]=useState([]);
  const [editMachineSI,setEditMachineSI]=useState(null);
  const [searchTerm,setSearchTerm]=useState("");

  /* ================= FETCH MACHINES ================= */
  const fetchMachines = async () => {
    try {
      const res = await api.get("/machines/getMachines"); // ✅ UPDATED

      if(res.data && Array.isArray(res.data.data)){
        const machines = res.data.data.map((item,index)=>({
          tableId: index+1,
          SI: item.SI,
          machineCode: item.MachineCode,
          machineName: item.MachineName,
          department: item.Department,
          created: item.CreatedDate ? new Date(item.CreatedDate).toLocaleString() : "-",
          updated: item.UpdatedDate ? new Date(item.UpdatedDate).toLocaleString() : "-"
        }));
        setMachineList(machines);
      } else {
        setMachineList([]);
      }
    } catch (error) {
      console.error("Fetch Machines API Error:", error);
      alert("Failed to fetch machines from backend");
      setMachineList([]);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(()=>{
    fetchMachines();
  },[]);

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async ()=>{
    if(!machineCode || !machineName){
      alert("Enter Machine Code and Name");
      return;
    }

    try {
      if(editMachineSI){
        // UPDATE
        const payload = {
          SI: editMachineSI,
          MachineCode: machineCode,
          MachineName: machineName,
          Department: department
        };

        const res = await api.post("/machines/updateMachine", payload); // ✅ UPDATED

        if(res.data && res.data.status===1){
          alert("Machine updated successfully");
          fetchMachines();
        } else {
          alert("Failed to update machine");
        }

      } else {
        // CREATE
        const payload = {
          MachineCode: machineCode,
          MachineName: machineName,
          Department: department
        };

        const res = await api.post("/machines/createMachine", payload); // ✅ UPDATED

        if(res.data && res.data.status===1){
          alert("Machine created successfully");
          fetchMachines();
        } else {
          alert("Failed to create machine");
        }
      }

      // Reset form
      setMachineCode("");
      setMachineName("");
      setDepartment("");
      setEditMachineSI(null);

    } catch(error){
      console.error("Submit API Error:", error?.response || error);
      alert(error?.response?.data?.message || "Operation failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (index)=>{
    const item = machineList[index];
    setMachineCode(item.machineCode);
    setMachineName(item.machineName);
    setDepartment(item.department);
    setEditMachineSI(item.SI);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (index)=>{
    const item = machineList[index];
    if(!window.confirm("Are you sure to delete this machine?")) return;

    try {
      const payload = { SI: item.SI };

      const res = await api.post("/machines/deleteMachine", payload); // ✅ UPDATED

      if(res.data && res.data.status===1){
        alert("Machine deleted successfully");
        fetchMachines();
      } else {
        alert("Failed to delete machine");
      }

    } catch(error){
      console.error("Delete API Error:", error?.response || error);
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  /* ================= SEARCH ================= */
  const filteredData = machineList.filter((item)=>
    item.machineCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.machineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="machine-page">

      <Sidebar/>
      <Topbar/>

      <div className="machine-header">
        <div>
          <h1>Machine Master</h1>
          <p>Manage machines and departments</p>
        </div>
      </div>

      <div className="machine-form">
        <div className="form-row">
          <div className="form-group">
            <label>Machine Code</label>
            <input type="text" value={machineCode} onChange={(e)=>setMachineCode(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Machine Name</label>
            <input type="text" value={machineName} onChange={(e)=>setMachineName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input type="text" value={department} onChange={(e)=>setDepartment(e.target.value)} />
          </div>
        </div>

        <button className="add-btn" onClick={handleSubmit}>
          {editMachineSI ? "Update" : "Submit"}
        </button>
      </div>

      <div className="machine-search">
        <i className="fa fa-search"></i>
        <input type="text" placeholder="Search machine..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
      </div>

      <div className="table-card">
        <table className="machine-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Machine Code</th>
              <th>Machine Name</th>
              <th>Department</th>
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length===0 ? (
              <tr>
                <td colSpan="7" className="machine-empty">No Machine Found</td>
              </tr>
            ) : (
              filteredData.map((item,index)=>(
                <tr key={item.tableId}>
                  <td>{item.tableId}</td>
                  <td>{item.machineCode}</td>
                  <td>{item.machineName}</td>
                  <td>{item.department}</td>
                  <td>
                    <button className="machine-edit-btn" onClick={()=>handleEdit(index)}>
                      <i className="fa fa-edit"></i>
                    </button>
                    <button className="machine-delete-btn" onClick={()=>handleDelete(index)}>
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

export default MachineMaster;