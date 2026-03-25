import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/LineReturn.css";
import api from "../api";

function LineReturn() {

  const [productName,setProductName] = useState("");
  const [productUOM,setProductUOM] = useState("");
  const [productQty,setProductQty] = useState("");

  const [toolName,setToolName] = useState("");
  const [toolQty,setToolQty] = useState("");

  const [workerName,setWorkerName] = useState("");
  const [machineName,setMachineName] = useState("");

  const [lineReturns,setLineReturns] = useState([]);

  const [productOptions,setProductOptions] = useState([]);
  const [toolOptions,setToolOptions] = useState([]);
  const [workerOptions,setWorkerOptions] = useState([]);
  const [machineOptions,setMachineOptions] = useState([]);
  const [uomOptions,setUomOptions] = useState([]);

  useEffect(()=>{
    fetchProducts();
    fetchTools();
    fetchWorkers();
    fetchMachines();
    fetchUOM();
    fetchLineReturns();
  },[]);

  const fetchProducts = async ()=>{
    const res = await api.get("/activeitems/activeitem");
    if(res.data.status===1) setProductOptions(res.data.data);
  };

  const fetchTools = async ()=>{
    const res = await api.get("/activetools/activetool");
    if(res.data.status===1) setToolOptions(res.data.data);
  };

  const fetchWorkers = async ()=>{
    const res = await api.get("/getactiveworker/activeworker");
    if(res.data.status===1){
      const data = res.data.data.map(w=>w.WorkerName || w.worker_name || w);
      setWorkerOptions(data);
    }
  };

  const fetchMachines = async ()=>{
    const res = await api.get("/activemachines/activemachine");
    if(res.data.status===1) setMachineOptions(res.data.data);
  };

  const fetchUOM = async ()=>{
    const res = await api.get("/activeuoms/activeUOM");
    if(res.data.status===1){
      const data = res.data.data.map(u=>u.UOMName || u);
      setUomOptions(data);
    }
  };

  const fetchLineReturns = async ()=>{
    const res = await api.get("/linereturn/list");
    if(res.data.status===1) setLineReturns(res.data.data);
  };

  /* CREATE LINE RETURN */

  const handleSubmit = async ()=>{

    if(!productName || !productUOM || !productQty){
      alert("Fill required fields");
      return;
    }

    const payload = {
      ItemName:productName,
      UOMName:productUOM,
      Quantity:Number(productQty),
      ToolName:toolName,
      ToolQty:Number(toolQty),
      WorkerName:workerName,
      MachineName:machineName,
      Rate:0,
      Status:"Completed"
    };

    const res = await api.post("/linereturn/create",payload);

    alert(res.data.message);

    fetchLineReturns();

    setProductName("");
    setProductUOM("");
    setProductQty("");
    setToolName("");
    setToolQty("");
    setWorkerName("");
    setMachineName("");
  };

  return(
    <div className="lr-page">

      <Sidebar/>
      <Topbar/>

      <div className="lr-header">
        <h1>Line Return</h1>
        <p>Return items from line to stock</p>
      </div>

      {/* FORM */}

      <div className="lr-form">

        <div className="lr-row">

          <div className="lr-group">
            <label>Product</label>
            <select value={productName} onChange={(e)=>setProductName(e.target.value)}>
              <option value="">Select Product</option>
              {productOptions.map((p,i)=>(
                <option key={i}>{p.ItemName || p}</option>
              ))}
            </select>
          </div>

          <div className="lr-group">
            <label>Product UOM</label>
            <select value={productUOM} onChange={(e)=>setProductUOM(e.target.value)}>
              <option value="">Select UOM</option>
              {uomOptions.map((u,i)=>(
                <option key={i}>{u}</option>
              ))}
            </select>
          </div>

          <div className="lr-group">
            <label>Product Qty</label>
            <input
            type="number"
            value={productQty}
            onChange={(e)=>setProductQty(e.target.value)}
            />
          </div>

        </div>


        <div className="lr-row">

          <div className="lr-group">
            <label>Tool</label>
            <select value={toolName} onChange={(e)=>setToolName(e.target.value)}>
              <option value="">Select Tool</option>
              {toolOptions.map((t,i)=>(
                <option key={i}>{t.ToolName || t}</option>
              ))}
            </select>
          </div>

          <div className="lr-group">
            <label>Tool Qty</label>
            <input
            type="number"
            value={toolQty}
            onChange={(e)=>setToolQty(e.target.value)}
            />
          </div>

        </div>


        <div className="lr-row">

          <div className="lr-group">
            <label>Worker</label>
            <select value={workerName} onChange={(e)=>setWorkerName(e.target.value)}>
              <option value="">Select Worker</option>
              {workerOptions.map((w,i)=>(
                <option key={i} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="lr-group">
            <label>Machine</label>
            <select value={machineName} onChange={(e)=>setMachineName(e.target.value)}>
              <option value="">Select Machine</option>
              {machineOptions.map((m,i)=>(
                <option key={i}>{m.MachineName || m}</option>
              ))}
            </select>
          </div><br></br>

        </div>

        <button className="lr-btn" onClick={handleSubmit}>
          Submit Line Return
        </button>

      </div>

      {/* TABLE */}

      <div className="lr-table-card">

        <h2>Line Return History</h2>

        <table className="lr-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>UOM</th>
              <th>Qty</th>
              <th>Tool</th>
              <th>Tool Qty</th>
              <th>Worker</th>
              <th>Machine</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>

            {lineReturns.length===0 ? (
              <tr>
                <td colSpan="9">No Data</td>
              </tr>
            ):(
              lineReturns.map((row,i)=>(
                <tr key={i}>
                  <td>{row.InID}</td>
                  <td>{row.ItemName}</td>
                  <td>{row.UOMName}</td>
                  <td>{row.Quantity}</td>
                  <td>{row.ToolName || "-"}</td>
                  <td>{row.ToolQty || "-"}</td>
                  <td>{row.WorkerName}</td>
                  <td>{row.MachineName}</td>
                  <td>{new Date(row.CreatedDate).toLocaleString()}</td>
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