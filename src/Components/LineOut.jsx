// import React, { useState, useEffect } from "react";
// import api from "../api";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";
// import "../CSS/LineOut.css";

// function WorkOrder() {

//   // ================= STATES =================
//   const [workDate, setWorkDate] = useState("");
//   const [machineName, setMachineName] = useState("");
//   const [workerName, setWorkerName] = useState("");

//   // ✅ MULTIPLE TOOLS
//   const [tools, setTools] = useState([
//     { tool_name: "", category_name: "", tool_qty: "" }
//   ]);

//   // ================= OPTIONS =================
//   const [toolOptions, setToolOptions] = useState([]);
//   const [machineOptions, setMachineOptions] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);
//   const [workerOptions, setWorkerOptions] = useState([]);

//   const [list, setList] = useState([]);

//   // ================= LOAD =================
//   useEffect(() => {
//     fetchTools();
//     fetchMachines();
//     fetchCategories();
//     fetchWorkers();
//     fetchData();
//   }, []);

//   const fetchTools = async () => {
//     try {
//       const res = await api.get("/workorder/activetool");
//       const data = res.data?.data || res.data || [];
//       setToolOptions(Array.isArray(data) ? data : []);
//     } catch {
//       setToolOptions([]);
//     }
//   };

//   const fetchMachines = async () => {
//     try {
//       const res = await api.get("/workorder/activemachine");
//       const data = res.data?.data || res.data || [];
//       setMachineOptions(Array.isArray(data) ? data : []);
//     } catch {
//       setMachineOptions([]);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/workorder/activeCategorie");
//       const data = res.data?.data || res.data || [];
//       setCategoryOptions(Array.isArray(data) ? data : []);
//     } catch {
//       setCategoryOptions([]);
//     }
//   };

//   const fetchWorkers = async () => {
//     try {
//       const res = await api.get("/activeworkers/getWorkers");
//       if (res.data.status === 1) {
//         const data = res.data.data.map(
//           (w) => w.WorkerName || w.worker_name || w
//         );
//         setWorkerOptions(data);
//       }
//     } catch {
//       setWorkerOptions([]);
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const res = await api.get("/workorder/getlist");
//       if (res.data.status === 1) {
//         setList(res.data.data || []);
//       }
//     } catch {
//       setList([]);
//     }
//   };

//   // ================= TOOL HANDLERS =================
//   const addToolRow = () => {
//     setTools([...tools, { tool_name: "", category_name: "", tool_qty: "" }]);
//   };

//   const removeToolRow = (index) => {
//     const updated = [...tools];
//     updated.splice(index, 1);
//     setTools(updated);
//   };

//   const handleToolChange = (index, field, value) => {
//     const updated = [...tools];
//     updated[index][field] = value;
//     setTools(updated);
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!workDate || tools.length === 0) {
//       alert("Please fill required fields");
//       return;
//     }

//     const payload = {
//       work_date: workDate,
//       machine_name: machineName,
//       worker_name: workerName,
//       tools: tools.map((t) => ({
//         tool_name: t.tool_name,
//         category_name: t.category_name,
//         tool_qty: Number(t.tool_qty)
//       }))
//     };

//     console.log("PAYLOAD:", payload);

//     try {
//       const res = await api.post("/workorder/createworkorder", payload);

//       if (res.data.status === 1) {
//         alert("Saved Successfully");

//         setWorkDate("");
//         setMachineName("");
//         setWorkerName("");
//         setTools([{ tool_name: "", category_name: "", tool_qty: "" }]);

//         fetchData();
//       } else {
//         alert(res.data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving");
//     }
//   };

//   // ================= COMPLETE =================
//   const handleComplete = async (date) => {
//     if (!window.confirm("Mark as Completed?")) return;

//     try {
//       const res = await api.put("/workorder/completeworkorder", {
//         work_date: date
//       });

//       if (res.data.status === 1) {
//         alert("Completed & Stock Updated");
//         fetchData();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ================= UI =================
//   return (
//     <div className="cs-page">
//       <Sidebar />
//       <Topbar />

//       <div className="cs-header">
//         <h1>Line Out Entry</h1>
//       </div>

//       {/* FORM */}
//       <div className="cs-table-card">
//         <h3>Create Work Entry</h3>

//         <form onSubmit={handleSubmit} className="cs-form">

//           {/* DATE */}
//           <input
//             type="date"
//             value={workDate}
//             onChange={(e) => setWorkDate(e.target.value)}
//             required
//           />

//           {/* MACHINE */}
//           <select value={machineName} onChange={(e) => setMachineName(e.target.value)}>
//             <option value="">Select Machine</option>
//             {machineOptions.map((m, i) => {
//               const name = m?.MachineName || m?.machine_name || m;
//               return <option key={i} value={name}>{name}</option>;
//             })}
//           </select>

//           {/* WORKER */}
//           <select value={workerName} onChange={(e) => setWorkerName(e.target.value)}>
//             <option value="">Select Worker</option>
//             {workerOptions.map((w, i) => (
//               <option key={i} value={w}>{w}</option>
//             ))}
//           </select>

//           {/* MULTIPLE TOOLS */}
//           {tools.map((tool, index) => (
//             <div key={index} className="cs-form" style={{ marginBottom: "10px" }}>

//               <select
//                 value={tool.tool_name}
//                 onChange={(e) =>
//                   handleToolChange(index, "tool_name", e.target.value)
//                 }
//               >
//                 <option value="">Select Tool</option>
//                 {toolOptions.map((t, i) => {
//                   const name = t?.ToolName || t?.tool_name || t;
//                   return <option key={i} value={name}>{name}</option>;
//                 })}
//               </select>

//               <select
//                 value={tool.category_name}
//                 onChange={(e) =>
//                   handleToolChange(index, "category_name", e.target.value)
//                 }
//               >
//                 <option value="">Select Category</option>
//                 {categoryOptions.map((c, i) => {
//                   const name = c?.CategoryName || c?.category_name || c;
//                   return <option key={i} value={name}>{name}</option>;
//                 })}
//               </select>

//               <input
//                 type="number"
//                 min="1"
//                 placeholder="Qty"
//                 value={tool.tool_qty}
//                 onChange={(e) =>
//                   handleToolChange(index, "tool_qty", e.target.value)
//                 }
//               />

//               {tools.length > 1 && (
//                 <button type="button" onClick={() => removeToolRow(index)}>
//                   ❌
//                 </button>
//               )}
//             </div>
//           ))}

//           <button type="button" onClick={addToolRow}>
//             ➕ Add Tool
//           </button>

//           <button type="submit">Save</button>
//         </form>
//       </div>

//       {/* TABLE */}
//       <div className="cs-table-card">
//         <h3>Work Entry List</h3>

//         <table className="cs-table">
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Tool</th>
//               <th>Category</th>
//               <th>Qty</th>
//               <th>Machine</th>
//               <th>Worker</th>
//               <th>Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {list.length === 0 ? (
//               <tr><td colSpan="7">No Data</td></tr>
//             ) : (
//               list.map((item, i) => (
//                 <tr key={i}>
//                   <td>{item.work_date}</td>
//                   <td>{item.tool_name}</td>
//                   <td>{item.category_name}</td>
//                   <td>{item.tool_qty}</td>
//                   <td>{item.machine_name}</td>
//                   <td>{item.worker_name}</td>
//                   <td>
//                     <button
//                       onClick={() => handleComplete(item.work_date)}
//                       disabled={item.status === "Completed"}
//                     >
//                       {item.status}
//                     </button>
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
  const [workDate, setWorkDate] = useState("");
  const [machineName, setMachineName] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [tools, setTools] = useState([{ tool_name: "", category_name: "", tool_qty: "" }]);

  const [toolOptions, setToolOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [workerOptions, setWorkerOptions] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchTools();
    fetchMachines();
    fetchCategories();
    fetchWorkers();
    fetchList();
  }, []);

  const fetchTools = async () => { try { const res = await api.get("/workorder/activetool"); setToolOptions(res.data.data || []); } catch { setToolOptions([]); } };
  const fetchMachines = async () => { try { const res = await api.get("/workorder/activemachine"); setMachineOptions(res.data.data || []); } catch { setMachineOptions([]); } };
  const fetchCategories = async () => { try { const res = await api.get("/workorder/activeCategorie"); setCategoryOptions(res.data.data || []); } catch { setCategoryOptions([]); } };
  const fetchWorkers = async () => { try { const res = await api.get("/activeworkers/getWorkers"); setWorkerOptions(res.data.data.map(w => w.WorkerName || w.worker_name) || []); } catch { setWorkerOptions([]); } };
  const fetchList = async () => { try { const res = await api.get("/workorder/getlist"); setList(res.data.data || []); } catch { setList([]); } };

  const addToolRow = () => setTools([...tools, { tool_name: "", category_name: "", tool_qty: "" }]);
  const removeToolRow = (index) => setTools(tools.filter((_, i) => i !== index));
  const handleToolChange = (index, field, value) => { const updated = [...tools]; updated[index][field] = value; setTools(updated); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workDate || !machineName || !workerName) return alert("Please fill date, machine, and worker");

    const filledTools = tools.filter(t => t.tool_name && t.category_name && t.tool_qty);
    if (!filledTools.length) return alert("Please add at least one tool with name, category, and quantity");

    try {
      const res = await api.post("/workorder/createworkorder", { work_date: workDate, machine_name: machineName, worker_name: workerName, tools: filledTools });
      if (res.data.status === 1) {
        alert(res.data.message);
        setWorkDate(""); setMachineName(""); setWorkerName(""); setTools([{ tool_name: "", category_name: "", tool_qty: "" }]);
        fetchList();
      } else alert(res.data.message);
    } catch { alert("Error saving"); }
  };

  const handleComplete = async (date) => {
    if (!window.confirm("Mark as Completed?")) return;
    try { const res = await api.put("/workorder/completeworkorder", { work_date: date }); if (res.data.status === 1) { alert(res.data.message); fetchList(); } } catch { }
  };

  return (
    <div className="cs-page">
      <Sidebar /><Topbar />
      <div className="cs-header"><h1>Line Out Entry</h1></div>

      {/* FORM */}
      <div className="cs-table-card">
        <h3>Create Work Entry</h3>
        <form onSubmit={handleSubmit} className="cs-form">
          <input type="date" value={workDate} onChange={e => setWorkDate(e.target.value)} required />
          <select value={machineName} onChange={e => setMachineName(e.target.value)} required>
            <option value="">Select Machine</option>
            {machineOptions.map((m, i) => <option key={i} value={m.MachineName || m}>{m.MachineName || m}</option>)}
          </select>
          <select value={workerName} onChange={e => setWorkerName(e.target.value)} required>
            <option value="">Select Worker</option>
            {workerOptions.map((w, i) => <option key={i} value={w}>{w}</option>)}
          </select>

          {tools.map((tool, index) => (
            <div key={index} className="cs-form" style={{ marginBottom: "10px" }}>
              <select value={tool.tool_name} onChange={e => handleToolChange(index, "tool_name", e.target.value)} required>
                <option value="">Select Tool</option>
                {toolOptions.map((t, i) => <option key={i} value={t.ToolName || t}>{t.ToolName || t}</option>)}
              </select>
              <select value={tool.category_name} onChange={e => handleToolChange(index, "category_name", e.target.value)} required>
                <option value="">Select Category</option>
                {categoryOptions.map((c, i) => <option key={i} value={c.CategoryName || c}>{c.CategoryName || c}</option>)}
              </select>
              <input type="number" min="1" placeholder="Qty" value={tool.tool_qty} onChange={e => handleToolChange(index, "tool_qty", e.target.value)} required />
              {tools.length > 1 && <button type="button" onClick={() => removeToolRow(index)}>❌</button>}
            </div>
          ))}

          <button type="button" onClick={addToolRow}>➕ Add Tool</button>
          <button type="submit">Save</button>
        </form>
      </div>

      {/* GRID */}
      <div className="cs-table-card">
        <h3>Work Entry List</h3>
        <table className="cs-table">
          <thead>
            <tr>
              <th>Date</th><th>Tool</th><th>Category</th><th>Qty</th><th>Machine</th><th>Worker</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan="7">No Data</td></tr> :
              list.map((item, i) => (
                <tr key={i}>
                  <td>{item.work_date}</td>
                  <td>{item.tool_name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.tool_qty}</td>
                  <td>{item.machine_name}</td>
                  <td>{item.worker_name}</td>
                  <td>
                    <button onClick={() => handleComplete(item.work_date)} disabled={item.status==="Completed"}>{item.status}</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkOrder;