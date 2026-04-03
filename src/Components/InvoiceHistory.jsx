import React, { useEffect, useState, useRef } from "react"; // ✅ added useRef
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js"; // ✅ added
import "../CSS/SalesPage.css";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const invoiceRef = useRef(); // ✅ added

  /* ================= LOAD INVOICES ================= */
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sales/invoices");

      if (res.data.status === 1) {
        setInvoices(res.data.data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Invoice Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW INVOICE ================= */
  const viewInvoice = (invoiceNo) => {
    navigate(`/dashboard/invoice/${invoiceNo}`);
  };

  /* ================= DOWNLOAD INVOICE ================= */
  const downloadInvoice = (invoiceNo) => {
    const element = document.getElementById(`invoice-${invoiceNo}`);

    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoiceNo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <div className="sales-header">
        <h1>Invoice History</h1>
      </div>

      <div className="sales-form">
        <div className="sales-table-container">
          <h2>Invoice List</h2>

          <table className="sales-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7">No invoices found</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.Invoice_ID} id={`invoice-${inv.Invoice_No}`}>
                    <td>{inv.Invoice_No}</td>
                    <td>{inv.Invoice_Date}</td>
                    <td>{inv.Customer_Name}</td>
                    <td>{inv.Customer_Phone}</td>
                    <td>{inv.Total_Amount}</td>
                    <td>{inv.Status}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => viewInvoice(inv.Invoice_No)}
                      >
                        View
                      </button>

                      {/* ✅ DOWNLOAD BUTTON */}
                      <button
                        className="sales-add-btn"
                        style={{ marginLeft: "10px" }}
                        onClick={() => downloadInvoice(inv.Invoice_No)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Refresh Button */}
          <div style={{ marginTop: "20px" }}>
            <button className="sales-add-btn" onClick={fetchInvoices}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceHistory;









// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";
// import { useNavigate } from "react-router-dom";
// import "../CSS/SalesPage.css";


// function InvoiceHistory() {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   /* ================= LOAD INVOICES ================= */
//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/sales/invoices");

//       if (res.data.status === 1) {
//         setInvoices(res.data.data);
//       } else {
//         setInvoices([]);
//       }
//     } catch (err) {
//       console.error("Invoice Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= VIEW INVOICE ================= */
//   const viewInvoice = (invoiceNo) => {
//     navigate(`/dashboard/invoice/${invoiceNo}`);
//   };

//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Invoice History</h1>
//       </div>

//       <div className="sales-form">
//         <div className="sales-table-container">
//           <h2>Invoice List</h2>

//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Invoice No</th>
//                 <th>Date</th>
//                 <th>Customer Name</th>
//                 <th>Phone</th>
//                 <th>Total Amount</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="7">Loading invoices...</td>
//                 </tr>
//               ) : invoices.length === 0 ? (
//                 <tr>
//                   <td colSpan="7">No invoices found</td>
//                 </tr>
//               ) : (
//                 invoices.map((inv) => (
//                   <tr key={inv.Invoice_ID}>
//                     <td>{inv.Invoice_No}</td>
//                     <td>{inv.Invoice_Date}</td>
//                     <td>{inv.Customer_Name}</td>
//                     <td>{inv.Customer_Phone}</td>
//                     <td>{inv.Total_Amount}</td>
//                     <td>{inv.Status}</td>

//                     <td>
//                       <button
//                         className="edit-btn"
//                         onClick={() => viewInvoice(inv.Invoice_No)}
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>

//           {/* Refresh Button */}
//           <div style={{ marginTop: "20px" }}>
//             <button className="sales-add-btn" onClick={fetchInvoices}>
//               Refresh
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InvoiceHistory;




// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";
// import "../CSS/SalesPage.css";
// import "../CSS/InvoiceModal.css";
// import InvoiceTemplate from "./InvoiceTemplate";

// function InvoiceHistory() {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);

//   /* ================= LOAD INVOICES ================= */
//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/sales/invoices");

//       if (res.data.status === 1) {
//         setInvoices(res.data.data);
//       } else {
//         setInvoices([]);
//       }
//     } catch (err) {
//       console.error("Invoice Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= VIEW INVOICE ================= */
//   const viewInvoice = (invoiceNo) => {
//     setSelectedInvoice(invoiceNo);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedInvoice(null);
//   };

//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Invoice History</h1>
//       </div>

//       <div className="sales-form">
//         <div className="sales-table-container">
//           <h2>Invoice List</h2>

//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Invoice No</th>
//                 <th>Date</th>
//                 <th>Customer Name</th>
//                 <th>Phone</th>
//                 <th>Total Amount</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="7">Loading invoices...</td>
//                 </tr>
//               ) : invoices.length === 0 ? (
//                 <tr>
//                   <td colSpan="7">No invoices found</td>
//                 </tr>
//               ) : (
//                 invoices.map((inv) => (
//                   <tr key={inv.Invoice_ID}>
//                     <td>{inv.Invoice_No}</td>
//                     <td>{inv.Invoice_Date}</td>
//                     <td>{inv.Customer_Name}</td>
//                     <td>{inv.Customer_Phone}</td>
//                     <td>{inv.Total_Amount}</td>
//                     <td>{inv.Status}</td>

//                     <td>
//                       <button
//                         className="edit-btn"
//                         onClick={() => viewInvoice(inv.Invoice_No)}
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>

//           <div style={{ marginTop: "20px" }}>
//             <button className="sales-add-btn" onClick={fetchInvoices}>
//               Refresh
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ================= MODAL ================= */}
//       {showModal && (
//         <div className="invoice-modal-overlay">
//           <div className="invoice-modal">
//             <button className="modal-close" onClick={closeModal}>
//               ✖
//             </button>

//             <InvoiceTemplate invoiceNo={selectedInvoice} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default InvoiceHistory;