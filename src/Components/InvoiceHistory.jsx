import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/SalesPage.css";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icons
import { FaEye, FaDownload } from "react-icons/fa";

// PDF
import html2pdf from "html2pdf.js";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoiceRef = useRef();

  /* ================= LOAD INVOICES ================= */
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sales/invoices");

      console.log("Invoice List API:", res);

      if (res.data && res.data.status === 1) {
        setInvoices(res.data.data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW INVOICE ================= */
  const viewInvoice = async (invoiceNo) => {
    console.log("Clicked Invoice:", invoiceNo);

    if (!invoiceNo) {
      toast.error("Invalid Invoice Number");
      return;
    }

    try {
      const res = await api.get(`/sales/invoice/${invoiceNo}`);

      console.log("View API Response:", res);

      if (res.data && res.data.status === 1) {
        setSelectedInvoice(res.data.data);
      } else {
        toast.error("Invoice not found");
      }
    } catch (err) {
      console.error("View API Error:", err);
      toast.error("Failed to load invoice");
    }
  };

  /* ================= DOWNLOAD PDF ================= */
  const downloadPDF = () => {
    if (!selectedInvoice) return;

    const element = invoiceRef.current;

    const opt = {
      margin: 0.5,
      filename: `Invoice_${selectedInvoice.Invoice_No}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();

    toast.success("Invoice downloaded");
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <ToastContainer position="top-right" autoClose={2000} />

      {/* ================= TABLE VIEW ================= */}
      {!selectedInvoice && (
        <>
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
                      <td colSpan="7">Loading...</td>
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

                        <td>
                          <button
                            className="icon-btn view-btn"
                            onClick={() => {
                              console.log("Row Data:", inv); // DEBUG
                              viewInvoice(inv.Invoice_No); // 🔥 use this
                            }}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: "20px" }}>
                <button className="sales-add-btn" onClick={fetchInvoices}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= INVOICE VIEW ================= */}
      {selectedInvoice && (
        <>
          <div
            className="sales-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>Invoice #{selectedInvoice.Invoice_No}</h1>

            <button className="download-top-btn" onClick={downloadPDF}>
              <FaDownload /> Download
            </button>
          </div>

          <div className="sales-form">
            <div className="invoice-container" ref={invoiceRef}>
              <h2>Invoice Details</h2>

              <p><strong>Date:</strong> {selectedInvoice.Invoice_Date}</p>
              <p><strong>Customer:</strong> {selectedInvoice.Customer_Name}</p>
              <p><strong>Phone:</strong> {selectedInvoice.Customer_Phone}</p>

              <hr />

              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedInvoice.Items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Item_Name}</td>
                      <td>{item.Quantity}</td>
                      <td>{item.Price}</td>
                      <td>{item.Total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={{ textAlign: "right", marginTop: "20px" }}>
                Total: ₹{selectedInvoice.Total_Amount}
              </h3>
            </div>

            {/* BACK BUTTON */}
            <div style={{ marginTop: "20px" }}>
              <button
                className="sales-add-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}
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