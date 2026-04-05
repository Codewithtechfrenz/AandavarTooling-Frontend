// import React, { useState, useEffect } from "react";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";
// import "../CSS/Deliverychallan.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import api from "../api";

// function DeliveryChallan() {
//   const [customerName, setCustomerName] = useState("");
//   const [productName, setProductName] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [productsList, setProductsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [productOptions, setProductOptions] = useState([]);
//   const [customerOptions, setCustomerOptions] = useState([]);

//   useEffect(() => {
//     fetchProducts();
//     fetchCustomers();
//     fetchDeliveryChallans();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const res = await api.get("/activeitems/activeitem");
//       if (res.data && res.data.data) setProductOptions(res.data.data);
//     } catch (error) {
//       console.error("Product API Error:", error);
//     }
//   };

//   const fetchCustomers = async () => {
//     try {
//       const res = await api.get("/custdrop/getdropCustomers");
//       if (res.data && res.data.data) setCustomerOptions(res.data.data);
//     } catch (error) {
//       console.error("Customer API Error:", error);
//     }
//   };

//   const fetchDeliveryChallans = async () => {
//     try {
//       const res = await api.get("/delivery/getDeliveryChallans");
//       console.log("Saved Delivery Challans:", res.data);
//     } catch (error) {
//       console.error("Delivery API Error:", error);
//     }
//   };

//   const addProduct = () => {
//     if (!customerName || !productName || !quantity) {
//       alert("Please fill all fields");
//       return;
//     }
//     const newProduct = {
//       id: productsList.length + 1,
//       customerName,
//       productName,
//       quantity,
//       created: new Date().toLocaleDateString(),
//     };
//     setProductsList([...productsList, newProduct]);
//     setProductName("");
//     setQuantity("");
//   };

//   const saveDeliveryChallan = async () => {
//     try {
//       for (const item of productsList) {
//         await api.post("/delivery/createDeliveryChallan", {
//           customer_name: item.customerName,
//           product_name: item.productName,
//           quantity: item.quantity,
//           created_date: new Date().toISOString().split("T")[0],
//         });
//       }
//     } catch (error) {
//       console.error("Save Error:", error);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────
//   // loadImageAsJpeg
//   // Loads ANY image (PNG / JPEG / WEBP) from a URL and re-encodes
//   // it as JPEG via an HTML canvas. This avoids jsPDF's "wrong PNG
//   // signature" error caused by files that have the wrong extension
//   // or non-standard PNG metadata.
//   // Returns: { dataUrl: "data:image/jpeg;base64,...", ok: true }
//   //       or { dataUrl: null, ok: false }  on failure.
//   // ─────────────────────────────────────────────────────────────
//   const loadImageAsJpeg = (url) =>
//     new Promise((resolve) => {
//       const img = new window.Image();
//       img.crossOrigin = "anonymous";

//       img.onload = () => {
//         try {
//           const canvas = document.createElement("canvas");
//           canvas.width  = img.naturalWidth  || img.width;
//           canvas.height = img.naturalHeight || img.height;
//           const ctx = canvas.getContext("2d");

//           // White background so transparency doesn't go black in JPEG
//           ctx.fillStyle = "#ffffff";
//           ctx.fillRect(0, 0, canvas.width, canvas.height);
//           ctx.drawImage(img, 0, 0);

//           const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
//           resolve({ dataUrl, ok: true });
//         } catch (e) {
//           console.warn("Canvas encode failed:", e);
//           resolve({ dataUrl: null, ok: false });
//         }
//       };

//       img.onerror = (e) => {
//         console.warn("Image load failed:", url, e);
//         resolve({ dataUrl: null, ok: false });
//       };

//       img.src = url;
//     });

//   // ─────────────────────────────────────────────────────────────
//   // safeWatermark — tries opacity via saveGraphicsState, falls back
//   // gracefully so the PDF never crashes on older jsPDF builds.
//   // ─────────────────────────────────────────────────────────────
//   const safeWatermark = (doc, dataUrl, x, y, w, h) => {
//     try {
//       doc.saveGraphicsState();
//       doc.setGState(new doc.GState({ opacity: 0.10, "fill-opacity": 0.10 }));
//       doc.addImage(dataUrl, "JPEG", x, y, w, h);
//       doc.restoreGraphicsState();
//     } catch (e) {
//       try {
//         doc.saveGraphicsState();
//         doc.setGState({ opacity: 0.10 });
//         doc.addImage(dataUrl, "JPEG", x, y, w, h);
//         doc.restoreGraphicsState();
//       } catch (e2) {
//         // Last resort: draw without opacity (still visible as logo)
//         doc.addImage(dataUrl, "JPEG", x, y, w, h);
//       }
//     }
//   };

//   // ─────────────────────────────────────────────────────────────
//   // generatePDF
//   // ─────────────────────────────────────────────────────────────
//   const generatePDF = async () => {
//     if (productsList.length === 0) {
//       alert("Add products first");
//       return;
//     }

//     try {
//       setLoading(true);
//       await saveDeliveryChallan();
//       fetchDeliveryChallans();

//       const doc        = new jsPDF("p", "mm", "a4");
//       const pageWidth  = doc.internal.pageSize.getWidth();   // 210
//       const pageHeight = doc.internal.pageSize.getHeight();  // 297

//       const bx           = 7;
//       const by           = 7;
//       const bw           = pageWidth  - 14;   // 196
//       const bh           = pageHeight - 14;   // 283
//       const borderBottom = by + bh;           // 290

//       // ── Load logo (canvas re-encode → always clean JPEG) ────
//       const { dataUrl: logoJpeg, ok: hasLogo } =
//         await loadImageAsJpeg("/AndavarLogo2.png");

//       // ══════════════════════════════════════════════════════
//       // 1. WATERMARK  (first layer — behind everything)
//       //    Logo is landscape ≈ 1.8 : 1
//       //    Centred on full A4 page
//       // ══════════════════════════════════════════════════════
//       if (hasLogo) {
//         const wmW = 140;
//         const wmH = 78;
//         const wmX = (pageWidth  - wmW) / 2;   // 35
//         const wmY = (pageHeight - wmH) / 2;   // 109.5
//         safeWatermark(doc, logoJpeg, wmX, wmY, wmW, wmH);
//       }

//       // ══════════════════════════════════════════════════════
//       // 2. PAGE BORDER
//       // ══════════════════════════════════════════════════════
//       doc.setDrawColor(0);
//       doc.setLineWidth(0.7);
//       doc.rect(bx, by, bw, bh);

//       // ══════════════════════════════════════════════════════
//       // 3. HEADER BOX
//       // ══════════════════════════════════════════════════════
//       doc.setLineWidth(0.4);
//       doc.rect(bx, by, bw, 50);

//       // "DELIVERY CHALLAN" label box — top right
//       doc.rect(143, by, 57, 13);
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(0, 0, 0);
//       doc.text("DELIVERY CHALLAN", 171.5, 15.5, { align: "center" });

//       // Cell number
//       doc.setFontSize(9);
//       doc.setFont("helvetica", "normal"); 
//       doc.text("Cell : 9944130610", 171.5, 24, { align: "center" });

//       // Logo — top LEFT of header  (56 × 31 — landscape ratio)
//       if (hasLogo) {
//         doc.addImage(logoJpeg, "JPEG", 9, 12, 56, 31);
//       }

//       // Company details (x=69 clears the 56-wide logo)
//       doc.setFontSize(19);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(0, 0, 0);
//       doc.text("SHREE AANDAVAR TOOLING", 69, 22);

//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       // doc.text("", 69, 29);

//       doc.setFontSize(9);
//       doc.text(
//         "5/520 D, Kabeer Nagar MasthanPatti Madurai - 20.",
//         69, 35
//       );
//       doc.text("mailto : prabusangari690@gmail.com", 69, 41);

//       doc.setFont("helvetica", "bold");
//       doc.text(`Date : ${new Date().toLocaleDateString()}`, 143, 48);

//       // ══════════════════════════════════════════════════════
//       // 4. SUB-HEADER: Challan No + Customer
//       // ══════════════════════════════════════════════════════
//       const subY = 62;
//       doc.setLineWidth(0.3);
//       doc.line(bx, subY - 3, bx + bw, subY - 3);
//       doc.line(bx, subY + 9, bx + bw, subY + 9);

//       doc.setFontSize(10);
//       doc.setFont("helvetica", "bold");
//       doc.text("Challan No :", 12, subY + 5);
//       doc.setFont("helvetica", "normal");
//       doc.text(
//         "DC-" + String(productsList.length).padStart(3, "0"),
//         44, subY + 5
//       );
//       doc.setFont("helvetica", "bold");
//       doc.text("To :", 100, subY + 5);
//       doc.setFont("helvetica", "normal");
//       doc.text(customerName, 112, subY + 5);

//       // ══════════════════════════════════════════════════════
//       // 5. PRODUCT TABLE
//       // ══════════════════════════════════════════════════════
//       autoTable(doc, {
//         startY: subY + 12,
//         head: [["S.No", "Product Name", "Quantity", "Date"]],
//         body: productsList.map((item, idx) => [
//           idx + 1,
//           item.productName,
//           item.quantity,
//           item.created,
//         ]),
//         theme: "grid",
//         headStyles: {
//           fillColor: [0, 100, 200],
//           textColor: 255,
//           fontStyle: "bold",
//           fontSize: 10,
//           halign: "center",
//         },
//         bodyStyles: { fontSize: 9, halign: "center" },
//         columnStyles: { 1: { halign: "left" } },
//         margin: { left: 9, right: 9 },
//         tableLineColor: [180, 180, 180],
//         tableLineWidth: 0.3,
//       });

//       // ══════════════════════════════════════════════════════
//       // 6. FOOTER — pinned inside border
//       //   borderBottom = 290
//       //   footerDiv    = 262
//       //   footerTextY  = 270
//       //   sigLineY     = 278
//       //   sigLabelY    = 284  (6 px above border ✓)
//       // ══════════════════════════════════════════════════════
//       const footerDiv   = borderBottom - 28;
//       const footerTextY = footerDiv    +  8;
//       const sigLineY    = footerDiv    + 16;
//       const sigLabelY   = sigLineY     +  6;

//       doc.setLineWidth(0.4);
//       doc.line(bx, footerDiv, bx + bw, footerDiv);

//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       doc.setTextColor(0, 0, 0);
//       doc.text("Received the goods in good condition", 12, footerTextY);
//       doc.text(
//         "For Shree Aandavar Tooling",
//         bx + bw - 5, footerTextY,
//         { align: "right" }
//       );

//       doc.setLineWidth(0.3);
//       doc.line(12,            sigLineY, 75,           sigLineY);
//       doc.line(bx + bw - 68, sigLineY, bx + bw - 5,  sigLineY);

//       doc.setFontSize(9);
//       doc.text("Party's Signature", 12, sigLabelY);
//       doc.text("Signatory", bx + bw - 5, sigLabelY, { align: "right" });

//       doc.save("Delivery_Challan.pdf");

//     } catch (error) {
//       console.error("PDF generation error:", error);
//       alert("PDF Error: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ═══════════════════════════════════════════════════════════
//   // WEB PAGE — original design & structure completely unchanged
//   // ═══════════════════════════════════════════════════════════
//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Delivery Challan</h1>
//         <p>Add multiple products for a single customer</p>
//       </div>

//       <div className="sales-form">
//         <div className="sales-row">
//           <div className="sales-group">
//             <label>Customer Name</label>
//             <select
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//               disabled={productsList.length > 0}
//             >
//               <option value="">Select Customer</option>
//               {customerOptions.map((customer, index) => (
//                 <option
//                   key={index}
//                   value={
//                     typeof customer === "string"
//                       ? customer
//                       : customer.customer_name
//                   }
//                 >
//                   {typeof customer === "string"
//                     ? customer
//                     : customer.customer_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="sales-row">
//           <div className="sales-group">
//             <label>Product Name</label>
//             <select
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//             >
//               <option value="">Select Product</option>
//               {productOptions.map((product, index) => (
//                 <option
//                   key={index}
//                   value={
//                     typeof product === "string"
//                       ? product
//                       : product.product_name
//                   }
//                 >
//                   {typeof product === "string"
//                     ? product
//                     : product.product_name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="sales-group">
//             <label>Quantity</label>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//             />
//           </div>
//         </div>

//         <button className="sales-add-btn" onClick={addProduct}>
//           Add Product
//         </button>

//         <button
//           className="sales-pdf-btn"
//           onClick={generatePDF}
//           disabled={loading}
//         >
//           {loading ? "Generating PDF..." : "Generate PDF"}
//         </button>
//       </div>

//       <div className="sales-table-card">
//         <table className="sales-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Customer</th>
//               <th>Product Name</th>
//               <th>Quantity</th>
//               <th>Created</th>
//             </tr>
//           </thead>
//           <tbody>
//             {productsList.length === 0 ? (
//               <tr>
//                 <td colSpan="5">No Products Added</td>
//               </tr>
//             ) : (
//               productsList.map((item) => (
//                 <tr key={item.id}>
//                   <td>{item.id}</td>
//                   <td>{item.customerName}</td>
//                   <td>{item.productName}</td>
//                   <td>{item.quantity}</td>
//                   <td>{item.created}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default DeliveryChallan;



// import React, { useState, useEffect } from "react";
// import api from "../api"; // your axios instance
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";
// import "../CSS/Returndeliverychallan.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// function DeliveryChallan() {
//   const [challanNo, setChallanNo] = useState("");
//   const [customerName, setCustomerName] = useState("");
//   const [productName, setProductName] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [productsList, setProductsList] = useState([]);

//   const [productOptions, setProductOptions] = useState([]);
//   const [customerOptions, setCustomerOptions] = useState([]);

//   useEffect(() => {
//     fetchProducts();
//     fetchCustomers();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const res = await api.get("/activeitems/activeitem");
//       if (res.data && res.data.data) setProductOptions(res.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchCustomers = async () => {
//     try {
//       const res = await api.get("/custdrop/getdropCustomers");
//       if (res.data && res.data.data) setCustomerOptions(res.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // Add Product → Save Single Item to DB
//   const addProduct = async () => {
//     if (!challanNo || !customerName || !productName || !quantity) {
//       alert("Please fill all fields");
//       return;
//     }

//     const newItem = {
//       customerName,
//       productName,
//       quantity,
//       created: new Date().toLocaleDateString(),
//     };

//     try {
//       await api.post("/delivery/createDeliveryChallanItem", {
//         DeliveryChallanNo: challanNo,
//         customer_name: customerName,
//         product_name: productName,
//         quantity: quantity,
//         created_date: new Date().toISOString().split("T")[0],
//       });

//       // Add to local state for PDF table
//       setProductsList([...productsList, newItem]);

//       // Reset product fields
//       setProductName("");
//       setQuantity("");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to add product");
//     }
//   };

//   // Generate PDF from local state
//   const generatePDF = () => {
//     if (!challanNo || productsList.length === 0) {
//       alert("Add products first and enter Challan No");
//       return;
//     }

//     const doc = new jsPDF();

//     doc.setFontSize(18);
//     doc.text("Aandavar Tooling", 14, 15);

//     doc.setFontSize(11);
//     doc.text("Company Address: Madurai, Tamil Nadu, India", 14, 22);

//     doc.setFontSize(14);
//     doc.text("Delivery Challan", 14, 35);

//     doc.setFontSize(11);
//     doc.text(`Challan No: ${challanNo}`, 14, 42);
//     doc.text(`Customer: ${customerName}`, 14, 48);
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 42);

//     const tableColumn = ["ID", "Customer", "Product", "Quantity", "Created"];
//     const tableRows = productsList.map((item, index) => [
//       index + 1,
//       item.customerName,
//       item.productName,
//       item.quantity,
//       item.created,
//     ]);

//     autoTable(doc, {
//       startY: 55,
//       head: [tableColumn],
//       body: tableRows,
//     });

//     doc.save(`DeliveryChallan_${challanNo}.pdf`);

//     // Clear local state for new challan
//     setChallanNo("");
//     setCustomerName("");
//     setProductsList([]);
//     setProductName("");
//     setQuantity("");
//   };

//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Delivery Challan</h1>
//         <p>Add multiple products for a single customer</p>
//       </div>

//       <div className="sales-form">
//         <div className="sales-row">
//           <div className="sales-group">
//             <label>Challan Number</label>
//             <input
//               type="text"
//               value={challanNo}
//               onChange={(e) => setChallanNo(e.target.value)}
//               placeholder="Enter Challan Number"
//               disabled={productsList.length > 0}
//             />
//           </div>

//           <div className="sales-group">
//             <label>Customer Name</label>
//             <select
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//               disabled={productsList.length > 0}
//             >
//               <option value="">Select Customer</option>
//               {customerOptions.map((c, i) => (
//                 <option key={i} value={c.customer_name || c}>
//                   {c.customer_name || c}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="sales-row">
//           <div className="sales-group">
//             <label>Product Name</label>
//             <select
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//             >
//               <option value="">Select Product</option>
//               {productOptions.map((p, i) => (
//                 <option key={i} value={p.product_name || p}>
//                   {p.product_name || p}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="sales-group">
//             <label>Quantity</label>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               placeholder="Enter Quantity"
//             />
//           </div>
//         </div>

//         <button className="sales-add-btn" onClick={addProduct}>
//           Add Product
//         </button>
//         <button className="sales-pdf-btn" onClick={generatePDF}>
//           Generate PDF
//         </button>
//       </div>

//       <div className="sales-table-card">
//         <table className="sales-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Customer</th>
//               <th>Product</th>
//               <th>Quantity</th>
//               <th>Created</th>
//             </tr>
//           </thead>
//           <tbody>
//             {productsList.length === 0 ? (
//               <tr>
//                 <td colSpan="5">No Products Added</td>
//               </tr>
//             ) : (
//               productsList.map((item, index) => (
//                 <tr key={index}>
//                   <td>{index + 1}</td>
//                   <td>{item.customerName}</td>
//                   <td>{item.productName}</td>
//                   <td>{item.quantity}</td>
//                   <td>{item.created}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default DeliveryChallan;




import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/Returndeliverychallan.css";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DeliveryChallanTemplate from "./DeliveryChallanTemplate";

function DeliveryChallan() {
  const [challanNo, setChallanNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");

  const [productsList, setProductsList] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  const challanRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");
      setProductOptions(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/custdrop/getdropCustomers");
      setCustomerOptions(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Add product (same)
  const addProduct = async () => {
    if (!challanNo || !customerName || !productName || !quantity) {
      alert("Please fill all fields");
      return;
    }

    const newItem = {
      customerName,
      productName,
      quantity,
      created: new Date().toLocaleDateString(),
    };

    try {
      await api.post("/delivery/createDeliveryChallanItem", {
        DeliveryChallanNo: challanNo,
        customer_name: customerName,
        product_name: productName,
        quantity,
        created_date: new Date().toISOString().split("T")[0],
      });

      setProductsList([...productsList, newItem]);
      setProductName("");
      setQuantity("");
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  // 🔥 NEW PDF (Template based, UI unchanged)
  const generatePDF = async () => {
    if (!challanNo || productsList.length === 0) {
      alert("Add products first");
      return;
    }

    try {
      const canvas = await html2canvas(challanRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`DeliveryChallan_${challanNo}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF failed");
    }
  };

  // 🔁 Data for template
  const challanData = {
    orderNo: challanNo,
    recipientName: customerName,
    recipientAddress: "Customer Address",
    date: new Date().toLocaleDateString(),
    items: productsList.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
    })),
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      {/* ✅ SAME OLD UI */}
      <div className="sales-header">
        <h1>Delivery Challan</h1>
        <p>Add multiple products for a single customer</p>
      </div>

      <div className="sales-form">
        <div className="sales-row">
          <div className="sales-group">
            <label>Challan Number</label>
            <input
              type="text"
              value={challanNo}
              onChange={(e) => setChallanNo(e.target.value)}
              placeholder="Enter Challan Number"
              disabled={productsList.length > 0}
            />
          </div>

          <div className="sales-group">
            <label>Customer Name</label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={productsList.length > 0}
            >
              <option value="">Select Customer</option>
              {customerOptions.map((c, i) => (
                <option key={i} value={c.customer_name || c}>
                  {c.customer_name || c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sales-row">
          <div className="sales-group">
            <label>Product Name</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            >
              <option value="">Select Product</option>
              {productOptions.map((p, i) => (
                <option key={i} value={p.product_name || p}>
                  {p.product_name || p}
                </option>
              ))}
            </select>
          </div>

          <div className="sales-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
            />
          </div>
        </div>

        <button className="sales-add-btn" onClick={addProduct}>
          Add Product
        </button>

        {/* 🔥 SAME BUTTON UI but new logic */}
        <button className="sales-pdf-btn" onClick={generatePDF}>
          Generate PDF
        </button>
      </div>

      <div className="sales-table-card">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {productsList.length === 0 ? (
              <tr>
                <td colSpan="5">No Products Added</td>
              </tr>
            ) : (
              productsList.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.customerName}</td>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.created}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔥 Hidden Template (ONLY for PDF) */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={challanRef}>
          <DeliveryChallanTemplate challanData={challanData} />
        </div>
      </div>
    </div>
  );
}

export default DeliveryChallan;