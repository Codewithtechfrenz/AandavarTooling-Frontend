import React, { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import { useNavigate } from "react-router-dom";
import "../CSS/SalesPage.css";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icons
import { FaEye, FaDownload } from "react-icons/fa";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW INVOICE ================= */
  const viewInvoice = (invoiceNo) => {
    navigate(`/dashboard/invoice/${invoiceNo}`);
  };

  /* ================= SIMPLE DOWNLOAD ================= */
  const downloadInvoice = (invoiceNo) => {
    try {
      // Direct download URL (NO API CALL)
      const downloadUrl = `${api.defaults.baseURL}/sales/invoice/download/${invoiceNo}`;

      // Open in new tab → browser handles download
      window.open(downloadUrl, "_blank");

      toast.success("Downloading invoice...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    }
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <ToastContainer position="top-right" autoClose={2000} />

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
                  <tr key={inv.Invoice_ID}>
                    <td>{inv.Invoice_No}</td>
                    <td>{inv.Invoice_Date}</td>
                    <td>{inv.Customer_Name}</td>
                    <td>{inv.Customer_Phone}</td>
                    <td>{inv.Total_Amount}</td>
                    <td>{inv.Status}</td>

                    <td className="action-buttons">
                      {/* VIEW ICON */}
                      <button
                        className="icon-btn view-btn"
                        onClick={() => viewInvoice(inv.Invoice_No)}
                      >
                        <FaEye size={16} />
                      </button>

                      {/* DOWNLOAD ICON */}
                      <button
                        className="icon-btn download-btn"
                        onClick={() => downloadInvoice(inv.Invoice_No)}
                      >
                        <FaDownload size={16} />
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