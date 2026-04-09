// import React, { useState, useEffect } from "react";
// import api from "../api";

// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";

// import "../CSS/ToolMasters.css"; // you can reuse same CSS

// function InstrumentMaster() {
//   const [instrumentName, setInstrumentName] = useState("");
//   const [instrumentCode, setInstrumentCode] = useState("");
//   const [category, setCategory] = useState("");
//   const [status, setStatus] = useState("");
//   const [uom, setUom] = useState("");
//   const [minStock, setMinStock] = useState("");

//   const [uomOptions, setUomOptions] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);

//   const [instrumentList, setInstrumentList] = useState([]);
//   const [editIndex, setEditIndex] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSI, setSelectedSI] = useState(null);

//   // ================= LOAD =================
//   const fetchInstruments = async () => {
//     try {
//       const res = await api.get("/instrument/getInstruments");

//       const data = res.data.data;

//       if (!Array.isArray(data)) return;

//       const formatted = data.map((item) => ({
//         id: item.SI,
//         SI: item.SI,
//         instrumentName: item.InstrumentName,
//         instrumentCode: item.InstrumentCode,
//         category: item.CategoryName,
//         minStock: item.MinStock,
//         uom: item.UOMName,
//         status: item.Status,
//         created: item.CreatedDate
//           ? new Date(item.CreatedDate).toLocaleString()
//           : "-",
//         updated: item.UpdatedDate
//           ? new Date(item.UpdatedDate).toLocaleString()
//           : "-",
//       }));

//       formatted.sort((a, b) => a.SI - b.SI);
//       setInstrumentList(formatted);
//     } catch {
//       toast.error("Failed to fetch instruments");
//     }
//   };

//   // ================= LOAD UOM =================
//   const fetchUOMOptions = async () => {
//     try {
//       const res = await api.get("/activeuoms/activeUOM");
//       if (res.data.data) setUomOptions(res.data.data);
//     } catch {
//       toast.error("Failed to fetch UOM");
//     }
//   };

//   // ================= LOAD CATEGORY =================
//   const fetchCategoryOptions = async () => {
//     try {
//       const res = await api.get("/activecategories/activeCategorie");
//       if (res.data.data) setCategoryOptions(res.data.data);
//     } catch {
//       toast.error("Failed to fetch Category");
//     }
//   };

//   useEffect(() => {
//     fetchInstruments();
//     fetchUOMOptions();
//     fetchCategoryOptions();
//   }, []);

//   // ================= SUBMIT =================
//   const handleSubmit = async () => {
//     if (!instrumentName || !instrumentCode) {
//       toast.warning("Enter Instrument Name and Code");
//       return;
//     }

//     try {
//       const payload = {
//         SI: selectedSI,
//         InstrumentName: instrumentName,
//         InstrumentCode: instrumentCode,
//         CategoryName: category || "",
//         MinStock: Number(minStock) || 0,
//         UOMName: uom || "",
//         Status: status || "Active",
//       };

//       const endpoint =
//         editIndex !== null && selectedSI
//           ? "/instrument/updateInstrument"
//           : "/instrument/createInstrument";

//       const res = await api.post(endpoint, payload);

//       if (res.data.status === 1) {
//         toast.success(
//           editIndex !== null
//             ? "Instrument Updated Successfully"
//             : "Instrument Created Successfully"
//         );
//       } else {
//         toast.error(res.data?.message || "Operation Failed");
//       }

//       fetchInstruments();
//     } catch {
//       toast.error("API Error");
//     }

//     // RESET
//     setInstrumentName("");
//     setInstrumentCode("");
//     setCategory("");
//     setStatus("");
//     setUom("");
//     setMinStock("");
//     setEditIndex(null);
//     setSelectedSI(null);
//   };

//   // ================= EDIT =================
//   const handleEdit = (index) => {
//     const item = filteredData[index];

//     setInstrumentName(item.instrumentName);
//     setInstrumentCode(item.instrumentCode);
//     setCategory(item.category);
//     setStatus(item.status);
//     setUom(item.uom);
//     setMinStock(item.minStock);
//     setSelectedSI(item.SI);
//     setEditIndex(index);
//   };

//   // ================= DELETE =================
//   const handleDelete = async (index) => {
//     const item = filteredData[index];

//     if (!window.confirm("Are you sure to delete?")) return;

//     try {
//       const res = await api.post("/instrument/deleteInstrument", {
//         SI: item.SI,
//       });

//       if (res.data.status === 1) {
//         toast.success("Instrument Deleted Successfully");
//         fetchInstruments();
//       } else {
//         toast.error("Delete Failed");
//       }
//     } catch {
//       toast.error("Delete Failed");
//     }
//   };

//   // ================= SEARCH =================
//   const filteredData = instrumentList.filter(
//     (item) =>
//       item.instrumentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.instrumentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.uom?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // ================= UI =================
//   return (
//     <div className="product-page">
//       <Sidebar />
//       <Topbar />

//       <ToastContainer position="top-right" autoClose={3000} theme="colored" />

//       <div className="product-header">
//         <div>
//           <h1>Instrument Master</h1>
//           <p>Manage instruments and stock levels</p>
//         </div>
//       </div>

//       {/* FORM */}
//       <div className="product-form">
//         <div className="form-row">
//           <div className="form-group">
//             <label>Instrument Name</label>
//             <input
//               value={instrumentName}
//               onChange={(e) => setInstrumentName(e.target.value)}
//             />
//           </div>

//           <div className="form-group">
//             <label>Instrument Code</label>
//             <input
//               value={instrumentCode}
//               onChange={(e) => setInstrumentCode(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Category</label>
//             <select value={category} onChange={(e) => setCategory(e.target.value)}>
//               <option value="">Select Category</option>
//               {categoryOptions.map((option, i) => (
//                 <option key={i} value={option}>{option}</option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)}>
//               <option value="">Select Status</option>
//               <option>Active</option>
//               <option>Inactive</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>UOM</label>
//             <select value={uom} onChange={(e) => setUom(e.target.value)}>
//               <option value="">Select UOM</option>
//               {uomOptions.map((option, i) => (
//                 <option key={i} value={option}>{option}</option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Available Stock</label>
//             <input
//               type="number"
//               value={minStock}
//               onChange={(e) => setMinStock(e.target.value)}
//             />
//           </div>
//         </div>

//         <button className="add-btn" onClick={handleSubmit}>
//           {editIndex !== null ? "Update" : "Submit"}
//         </button>
//       </div>

//       {/* SEARCH */}
//       <div className="product-search">
//         <input
//           type="text"
//           placeholder="Search instrument..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* TABLE */}
//       <div className="table-card">
//         <table className="product-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Instrument Name</th>
//               <th>Instrument Code</th>
//               <th>Category</th>
//               <th>MinStock</th>
//               <th>Status</th>
//               <th>UOM</th>
//               <th>Action</th>
//               <th>Created</th>
//               <th>Updated</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredData.length === 0 ? (
//               <tr>
//                 <td colSpan="10">No Instrument Found</td>
//               </tr>
//             ) : (
//               filteredData.map((item, index) => (
//                 <tr key={item.id}>
//                   <td>{item.id}</td>
//                   <td>{item.instrumentName}</td>
//                   <td>{item.instrumentCode}</td>
//                   <td>{item.category}</td>
//                   <td>{item.minStock}</td>
//                   <td>{item.status}</td>
//                   <td>{item.uom}</td>
//                   <td>
//                     <button onClick={() => handleEdit(index)}>Edit</button>
//                     <button onClick={() => handleDelete(index)}>Delete</button>
//                   </td>
//                   <td>{item.created}</td>
//                   <td>{item.updated}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default InstrumentMaster;




import React, { useState, useEffect } from "react";
import api from "../api";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

import "../CSS/ToolMasters.css";

// ✅ PDF
import jsPDF from "jspdf";
import "jspdf-autotable";

// ✅ LOGO
//import logo from "../assets/aandavartooling1.png";

function InstrumentMaster() {
  const [instrumentName, setInstrumentName] = useState("");
  const [instrumentCode, setInstrumentCode] = useState("");
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

  /* ================= LOAD ================= */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/instrument/getInstruments");

      const data = res.data.data || [];

      const formatted = data.map((item) => ({
        id: item.SI,
        SI: item.SI,
        instrumentName: item.InstrumentName,
        instrumentCode: item.InstrumentCode,
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

      setProductList(formatted);
    } catch {
      toast.error("Failed to fetch instruments");
    }
  };

  const fetchUOMOptions = async () => {
    const res = await api.get("/activeuoms/activeUOM");
    setUomOptions(res.data.data || []);
  };

  const fetchCategoryOptions = async () => {
    const res = await api.get("/activecategories/activeCategorie");
    setCategoryOptions(res.data.data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchUOMOptions();
    fetchCategoryOptions();
  }, []);

  /* ================= PDF DOWNLOAD ================= */
  const downloadPDF = () => {
    const doc = new jsPDF();

    // const img = new Image();
    // img.src = logo;

    // img.onload = () => {
    //   // LOGO
    //   doc.addImage(img, "PNG", 14, 10, 30, 15);

      // HEADER
      doc.setFontSize(16);
      doc.text("SHREE AANDAVAR TOOLING", 50, 15);

      doc.setFontSize(12);
      doc.text("Instrument Master Report", 50, 22);

      const currentDate = new Date().toLocaleDateString("en-GB");
      doc.text(`Date: ${currentDate}`, 150, 22);

      doc.text(`Total: ${filteredData.length}`, 14, 35);

      // TABLE
      const tableColumn = [
        "ID",
        "Instrument Name",
        "Code",
        "Category",
        "MinStock",
        "Status",
        "UOM",
      ];

      const tableRows = [];

      filteredData.forEach((item) => {
        tableRows.push([
          item.id,
          item.instrumentName,
          item.instrumentCode,
          item.category || "-",
          item.minStock,
          item.status,
          item.uom || "-",
        ]);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      // FOOTER
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.text(
        "Generated by Instrument Management System",
        14,
        pageHeight - 10
      );

      doc.save("Instrument_Master_Report.pdf");
    };
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!instrumentName || !instrumentCode) {
      toast.warning("Enter Instrument Name & Code");
      return;
    }

    try {
      const payload = {
        SI: selectedSI,
        InstrumentName: instrumentName,
        InstrumentCode: instrumentCode,
        CategoryName: category,
        MinStock: Number(minStock) || 0,
        UOMName: uom,
        Status: status || "Active",
      };

      const endpoint =
        editIndex !== null
          ? "/instrument/updateInstrument"
          : "/instrument/createInstrument";

      const res = await api.post(endpoint, payload);

      if (res.data.status === 1) {
        toast.success("Saved Successfully");
        fetchProducts();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("API Error");
    }

    // RESET
    setInstrumentName("");
    setInstrumentCode("");
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

    setInstrumentName(item.instrumentName);
    setInstrumentCode(item.instrumentCode);
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

    if (!window.confirm("Delete this record?")) return;

    await api.post("/instrument/deleteInstrument", { SI: item.SI });
    fetchProducts();
  };

  /* ================= SEARCH ================= */
  const filteredData = productList.filter(
    (item) =>
      item.instrumentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.instrumentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-page">
      <Sidebar />
      <Topbar />

      <ToastContainer />

      <div className="product-header">
        <h1>Instrument Master</h1>
      </div>

      <div className="product-form">
        <input
          placeholder="Instrument Name"
          value={instrumentName}
          onChange={(e) => setInstrumentName(e.target.value)}
        />
        <input
          placeholder="Instrument Code"
          value={instrumentCode}
          onChange={(e) => setInstrumentCode(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Select Category</option>
          {categoryOptions.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>

        <select value={uom} onChange={(e) => setUom(e.target.value)}>
          <option>Select UOM</option>
          {uomOptions.map((u, i) => (
            <option key={i}>{u}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Stock"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="product-search">
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* ✅ PDF BUTTON */}
        <button onClick={downloadPDF}>Download PDF</button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Category</th>
            <th>MinStock</th>
            <th>Status</th>
            <th>UOM</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.instrumentName}</td>
              <td>{item.instrumentCode}</td>
              <td>{item.category}</td>
              <td>{item.minStock}</td>
              <td>{item.status}</td>
              <td>{item.uom}</td>
              <td>
                <button onClick={() => handleEdit(index)}>Edit</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InstrumentMaster;