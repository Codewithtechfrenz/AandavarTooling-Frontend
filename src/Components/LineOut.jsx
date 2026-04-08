// import React, { useState, useEffect } from "react";
// import Sidebar from "./Sidebar";
// import Topbar from "./Topbar";
// import "../CSS/LineOut.css";
// import api from "../api";
 
// function WorkOrder() {
//   const [productName, setProductName] = useState("");
//   const [productUOM, setProductUOM] = useState("");
//   const [toolName, setToolName] = useState("");
//   const [workerName, setWorkerName] = useState("");
//   const [machineName, setMachineName] = useState("");
//   const [productQty, setProductQty] = useState("");
//   const [toolQty, setToolQty] = useState("");
//   const [workOrders, setWorkOrders] = useState([]);
 
//   const [productOptions, setProductOptions] = useState([]);
//   const [toolOptions, setToolOptions] = useState([]);
//   const [workerOptions, setWorkerOptions] = useState([]);
//   const [machineOptions, setMachineOptions] = useState([]);
//   const [uomOptions, setUOMOptions] = useState([]);
 
//   /* ================= LOAD DATA ================= */
//   useEffect(() => {
//     fetchProducts();
//     fetchTools();
//     fetchWorkers();
//     fetchMachines();
//     fetchUOMs();
//     fetchWorkOrders();
//   }, []);
 
//   const fetchProducts = async () => {
//     try {
//       const res = await api.get("/activeitems/activeitem");
//       setProductOptions(res.data.status === 1 ? res.data.data : []);
//     } catch (err) {
//       console.error("Product Error:", err);
//       setProductOptions([]);
//     }
//   };
 
//   const fetchTools = async () => {
//     try {
//       const res = await api.get("/activetools/activetool");
//       setToolOptions(res.data.status === 1 ? res.data.data : []);
//     } catch (err) {
//       console.error("Tool Error:", err);
//       setToolOptions([]);
//     }
//   };
 
//   const fetchWorkers = async () => {
//     try {
//       const res = await api.get("/activeworkers/getWorkers");
//       setWorkerOptions(res.data.status === 1 ? res.data.data : []);
//     } catch (err) {
//       console.error("Worker Error:", err);
//       setWorkerOptions([]);
//     }
//   };
 
//   const fetchMachines = async () => {
//     try {
//       const res = await api.get("/activemachines/activemachine");
//       setMachineOptions(res.data.status === 1 ? res.data.data : []);
//     } catch (err) {
//       console.error("Machine Error:", err);
//       setMachineOptions([]);
//     }
//   };
 
//   const fetchUOMs = async () => {
//     try {
//       const res = await api.get("/activeuoms/activeUOM");
 
//       if (res.data.status === 1) {
//         const formatted = res.data.data.map(
//           (u) => u.UOMName || u.uom_name || u
//         );
//         setUOMOptions(formatted);
//       } else {
//         setUOMOptions([]);
//       }
//     } catch (err) {
//       console.error("UOM Error:", err);
//       setUOMOptions([]);
//     }
//   };
 
//   const fetchWorkOrders = async () => {
//     try {
//       const res = await api.get("/workorder/list");
//       setWorkOrders(res.data.status === 1 ? res.data.data : []);
//     } catch (err) {
//       console.error("WorkOrder Error:", err);
//       setWorkOrders([]);
//     }
//   };
 
//   /* ================= CREATE ================= */
//   const handleCreateWorkOrder = async () => {
//     if (!productName || !productUOM || !productQty || !workerName || !machineName) {
//       alert("Please fill all required fields");
//       return;
//     }
 
//     const payload = {
//       ProductName: productName.trim(),
//       ProductUOM: productUOM.trim(),
//       ToolName: toolName ? toolName.trim() : null,
//       WorkerName:
//         typeof workerName === "object"
//           ? workerName.WorkerName || workerName.worker_name
//           : workerName.trim(),
//       MachineName:
//         typeof machineName === "object"
//           ? machineName.MachineName || machineName.machine_name
//           : machineName.trim(),
//       ProductQty: Number(productQty),
//       ToolQty: Number(toolQty) || 0,
//       Status: "Pending",
//     };
 
//     try {
//       const res = await api.post("/workorder/create", payload);
 
//       if (res.data.status === 1) {
//         alert(res.data.message);
//         fetchWorkOrders();
//         clearForm();
//       } else {
//         alert(res.data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error creating work order");
//     }
//   };
 
//   /* ================= COMPLETE ================= */
//   const handleComplete = async (WorkOrderID) => {
//     console.log("Completing WorkOrderID:", WorkOrderID);
 
//     try {
//       const res = await api.post("/workorder/complete", { WorkOrderID });
 
//       console.log("API RESPONSE:", res.data);
 
//       if (res.data.status === 1) {
//         alert(res.data.message);
//         fetchWorkOrders();
//       } else {
//         alert(res.data.error || res.data.message);
//       }
//     } catch (err) {
//       console.error("FULL ERROR:", err);
 
//       if (err.response) {
//         alert(err.response.data?.message || "Server error");
//       } else if (err.request) {
//         alert("Backend not responding");
//       } else {
//         alert(err.message);
//       }
//     }
//   };
 
//   /* ================= CLEAR ================= */
//   const clearForm = () => {
//     setProductName("");
//     setProductUOM("");
//     setToolName("");
//     setWorkerName("");
//     setMachineName("");
//     setProductQty("");
//     setToolQty("");
//   };
 
//   return (
//     <div className="wo-page">
//       <Sidebar />
//       <Topbar />
 
//       <div className="wo-header">
//         <h1>Work Order</h1>
//         <p>Create work orders with UOM</p>
//       </div>
 
//       <div className="wo-form">
//         {/* ===== PRODUCT ===== */}
//         <div className="wo-row">
//           <div className="wo-group">
//             <label>Product</label>
//             <select value={productName} onChange={e => setProductName(e.target.value)}>
//               <option value="">Select Product</option>
//               {productOptions.map((p, i) => {
//                 const name = typeof p === "string" ? p : p.ItemName || p.product_name;
//                 return (
//                   <option key={i} value={name}>
//                     {name}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
 
//           <div className="wo-group">
//             <label>Product UOM</label>
//             <select value={productUOM} onChange={e => setProductUOM(e.target.value)}>
//               <option value="">Select UOM</option>
//               {uomOptions.length > 0 ? (
//                 uomOptions.map((u, i) => (
//                   <option key={i} value={u}>{u}</option>
//                 ))
//               ) : (
//                 <option disabled>No UOM Found</option>
//               )}
//             </select>
//           </div>
 
//           <div className="wo-group">
//             <label>Product Qty</label>
//             <input
//               type="number"
//               value={productQty}
//               onChange={e => setProductQty(e.target.value)}
//             />
//           </div>
//         </div>
 
//         {/* ===== TOOL ===== */}
//         <div className="wo-row">
//           <div className="wo-group">
//             <label>Tool</label>
//             <select value={toolName} onChange={e => setToolName(e.target.value)}>
//               <option value="">Select Tool</option>
//               {toolOptions.map((t, i) => {
//                 const name = typeof t === "string" ? t : t.ToolName || t.tool_name;
//                 return (
//                   <option key={i} value={name}>
//                     {name}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
 
//           <div className="wo-group">
//             <label>Tool Qty</label>
//             <input
//               type="number"
//               value={toolQty}
//               onChange={e => setToolQty(e.target.value)}
//             />
//           </div>
//         </div>
 
//         {/* ===== WORKER + MACHINE ===== */}
//         <div className="wo-row">
//           <div className="wo-group">
//             <label>Worker</label>
//             <select value={workerName} onChange={e => setWorkerName(e.target.value)}>
//               <option value="">Select Worker</option>
//               {workerOptions.map((w, i) => {
//                 const name = typeof w === "string" ? w : w.WorkerName || w.worker_name;
//                 return (
//                   <option key={i} value={name}>
//                     {name}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
 
//           <div className="wo-group">
//             <label>Machine</label>
//             <select value={machineName} onChange={e => setMachineName(e.target.value)}>
//               <option value="">Select Machine</option>
//               {machineOptions.map((m, i) => {
//                 const name = typeof m === "string" ? m : m.MachineName || m.machine_name;
//                 return (
//                   <option key={i} value={name}>
//                     {name}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
//         </div>
 
//         <button className="wo-btn" onClick={handleCreateWorkOrder}>
//           Create Work Order
//         </button>
//       </div>
 
//       {/* ===== TABLE ===== */}
//       <div className="wo-table-card">
//         <h2>Work Orders</h2>
 
//         <table className="wo-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Product</th>
//               <th>UOM</th>
//               <th>Qty</th>
//               <th>Tool</th>
//               <th>Tool Qty</th>
//               <th>Worker</th>
//               <th>Machine</th>
//               <th>Status</th>
//               <th>Action</th>
//             </tr>
//           </thead>
 
//           <tbody>
//             {workOrders.length === 0 ? (
//               <tr><td colSpan="10">No Work Orders Found</td></tr>
//             ) : (
//               workOrders.map((order, i) => (
//                 <tr key={i}>
//                   <td>{order.WorkOrderID}</td>
//                   <td>{order.ProductName}</td>
//                   <td>{order.ProductUOM}</td>
//                   <td>{order.ProductQty}</td>
//                   <td>{order.ToolName || "-"}</td>
//                   <td>{order.ToolQty || "-"}</td>
//                   <td>{order.WorkerName}</td>
//                   <td>{order.MachineName}</td>
//                   <td>{order.Status}</td>
//                   <td>
//                     {order.Status === "Pending" && (
//                       <button onClick={() => handleComplete(order.WorkOrderID)}>
//                         Complete
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
 
// export default WorkOrder;

import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/LineOut.css";

function WorkOrder() {

  // ================= STATES =================
  const [workOrderNo, setWorkOrderNo] = useState("");
  const [toolName, setToolName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [toolQty, setToolQty] = useState("");
  const [machineName, setMachineName] = useState("");
  const [workerName, setWorkerName] = useState("");

  // ================= DROPDOWN OPTIONS =================
  const [toolOptions, setToolOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);

  // ================= TABLE =================
  const [list, setList] = useState([]);

  // ================= FETCH FUNCTIONS =================

  const fetchTools = async () => {
    try {
      const res = await api.get("/workorder/activetool");

      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data.result)) {
        data = res.data.result;
      }

      setToolOptions(data);

    } catch (err) {
      console.error("Tool Error:", err);
      setToolOptions([]);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await api.get("/workorder/activemachine");

      let data =
        res.data?.data ||
        res.data?.result ||
        res.data ||
        [];

      setMachineOptions(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Machine Error:", err);
      setMachineOptions([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/workorder/activeCategorie");

      let data =
        res.data?.data ||
        res.data?.result ||
        res.data ||
        [];

      setCategoryOptions(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Category Error:", err);
      setCategoryOptions([]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/activeworkers/getWorkers");

      if (res.data.status === 1) {
        const data = res.data.data.map(
          (w) => w.WorkerName || w.worker_name || w
        );
        setWorkerOptions(data);
      } else {
        setWorkerOptions([]);
      }
    } catch (err) {
      console.error("Worker Error:", err);
      setWorkerOptions([]);
    }
  };

  // ✅ FIXED API HERE
  const fetchData = async () => {
    try {
      const res = await api.get("/workorder/getlist"); // ✅ FIXED

      if (res.data.status === 1) {
        setList(res.data.data || []);
      } else {
        setList([]);
      }
    } catch (err) {
      console.error("List Error:", err);
      setList([]);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    fetchTools();
    fetchMachines();
    fetchCategories();
    fetchWorkers();
    fetchData();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!workOrderNo || !toolName || !toolQty) {
      alert("Please fill required fields");
      return;
    }

    // ✅ FIXED PAYLOAD KEY
    const payload = {
      work_order_no: workOrderNo,
      tools: toolName,              // ✅ IMPORTANT FIX
      category_name: categoryName,
      tool_qty: Number(toolQty),
      machine_name: machineName,
      worker_name: workerName,
    };

    try {
      const res = await api.post("/workorder/createworkorder", payload);

      if (res.data.status === 1) {
        alert(res.data.message || "Saved Successfully");

        // CLEAR FORM
        setWorkOrderNo("");
        setToolName("");
        setCategoryName("");
        setToolQty("");
        setMachineName("");
        setWorkerName("");

        fetchData(); // ✅ NOW GRID WILL UPDATE
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving data");
    }
  };

  // ================= COMPLETE =================
  const handleComplete = async (wo) => {
    if (!window.confirm("Mark as Completed?")) return;

    try {
      const res = await api.put(`/workorder/completeworkorder/${wo}`);

      if (res.data.status === 1) {
        alert("Work Order Completed");
        fetchData();
      }
    } catch (err) {
      console.error("Complete Error:", err);
    }
  };

  // ================= UI =================
  return (
    <div className="cs-page">
      <Sidebar />
      <Topbar />

      <div className="cs-header">
        <h1>Line Out Entry</h1>
      </div>

      {/* FORM */}
      <div className="cs-table-card">
        <h3>Create Work Order</h3>

        <form onSubmit={handleSubmit} className="cs-form">

          <input
            placeholder="Work Order No"
            value={workOrderNo}
            onChange={(e) => setWorkOrderNo(e.target.value)}
            required
          />

          <select value={toolName} onChange={(e) => setToolName(e.target.value)}>
            <option value="">Select Tool</option>
            {toolOptions.map((t, i) => {
              const name = t?.ToolName || t?.tool_name || t;
              return <option key={i} value={name}>{name}</option>;
            })}
          </select>

          <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}>
            <option value="">Select Category</option>
            {categoryOptions.map((c, i) => {
              const name = c?.CategoryName || c?.category_name || c;
              return <option key={i} value={name}>{name}</option>;
            })}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Tool Qty"
            value={toolQty}
            onChange={(e) => setToolQty(e.target.value)}
            required
          />

          <select value={machineName} onChange={(e) => setMachineName(e.target.value)}>
            <option value="">Select Machine</option>
            {machineOptions.map((m, i) => {
              const name = m?.MachineName || m?.machine_name || m;
              return <option key={i} value={name}>{name}</option>;
            })}
          </select>

          <select value={workerName} onChange={(e) => setWorkerName(e.target.value)}>
            <option value="">Select Worker</option>
            {workerOptions.map((w, i) => (
              <option key={i} value={w}>{w}</option>
            ))}
          </select>

          <button type="submit">Save</button>
        </form>
      </div>

      {/* TABLE */}
      <div className="cs-table-card">
        <h3>Work Order List</h3>

        <table className="cs-table">
          <thead>
            <tr>
              <th>WO No</th>
              <th>Tool</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Machine</th>
              <th>Worker</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="7">No Data</td></tr>
            ) : (
              list.map((item, i) => (
                <tr key={i}>
                  <td>{item.work_order_no}</td>
                  <td>{item.tools}</td> {/* ✅ FIXED */}
                  <td>{item.category_name}</td>
                  <td>{item.tool_qty}</td>
                  <td>{item.machine_name}</td>
                  <td>{item.worker_name}</td>
                  <td>
                    <button
                      onClick={() => handleComplete(item.work_order_no)}
                      disabled={item.status === "Completed"}
                    >
                      {item.status}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkOrder;