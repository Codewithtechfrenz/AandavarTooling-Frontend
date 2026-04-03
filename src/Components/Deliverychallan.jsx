import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/Deliverychallan.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api"; // Axios instance with baseURL

function DeliveryChallan() {
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productsList, setProductsList] = useState([]);

  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchDeliveryChallans();
  }, []);

  // ========== FETCH PRODUCTS ==========
  const fetchProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");
      if (res.data && res.data.data) {
        setProductOptions(res.data.data);
      }
    } catch (error) {
      console.error("Product API Error:", error);
    }
  };

  // ========== FETCH CUSTOMERS ==========
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/custdrop/getdropCustomers");
      if (res.data && res.data.data) {
        setCustomerOptions(res.data.data);
      }
    } catch (error) {
      console.error("Customer API Error:", error);
    }
  };

  // ========== FETCH DELIVERY CHALLANS ==========
  const fetchDeliveryChallans = async () => {
    try {
      const res = await api.get("/delivery/getDeliveryChallans");
      console.log("Saved Delivery Challans:", res.data);
    } catch (error) {
      console.error("Delivery API Error:", error);
    }
  };

  // ========== ADD PRODUCT TO TABLE ==========
  const addProduct = () => {
    if (!customerName || !productName || !quantity) {
      alert("Please fill all fields");
      return;
    }

    const newProduct = {
      id: productsList.length + 1,
      customerName,
      productName,
      quantity,
      created: new Date().toLocaleDateString(),
    };

    setProductsList([...productsList, newProduct]);
    setProductName("");
    setQuantity("");
  };

  // ========== SAVE DELIVERY CHALLAN TO DB ==========
  const saveDeliveryChallan = async () => {
    try {
      for (const item of productsList) {
        await api.post("/delivery/createDeliveryChallan", {
          customer_name: item.customerName,
          product_name: item.productName,
          quantity: item.quantity,
          created_date: new Date().toISOString().split("T")[0],
        });
      }
      console.log("Delivery Challan Saved");
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  // ========== GENERATE PDF ==========
  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    // Save in DB
    await saveDeliveryChallan();
    fetchDeliveryChallans();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ─── WATERMARK (SAT logo as faint text behind content) ───────────────────
    // Since we can't embed the actual image file at runtime without a hosted URL,
    // we draw a styled text watermark matching the SAT logo identity.
    // If you want the real image, replace the block below with:
    //   doc.addImage(base64SATLogo, "PNG", x, y, w, h);
    // after converting the logo to base64 and importing it.
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.07 }));
    doc.setFontSize(110);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 0, 0); // red matching SAT logo
    doc.text("SAT", pageWidth / 2, pageHeight / 2 + 20, {
      align: "center",
      angle: 0,
    });
    doc.restoreGraphicsState();

    // ─── OUTER BORDER ─────────────────────────────────────────────────────────
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // ─── HEADER ───────────────────────────────────────────────────────────────
    // Top label row: "DELIVERY CHALLAN" center-box + Cell right
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    // "DELIVERY CHALLAN" box in top center
    const dcBoxX = pageWidth / 2 - 28;
    doc.setLineWidth(0.5);
    doc.rect(dcBoxX, 10, 56, 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DELIVERY CHALLAN", pageWidth / 2, 15.5, { align: "center" });

    // Cell number top-right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Cell : 99441 30610", pageWidth - 12, 15.5, { align: "right" });

    // Logo placeholder left (small gear/label)
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 0, 0);
    doc.text("AANDAVAR", 13, 17);
    doc.text("TOOLING", 13, 21);
    doc.setTextColor(0, 0, 0);

    // Company name - large
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 10, 10);
    doc.text("Shree Aandavar Tooling", pageWidth / 2, 30, { align: "center" });

    // Tagline
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(50, 50, 50);
    doc.text(
      "CNC Machine Service and Tooling & Job Work",
      pageWidth / 2,
      37,
      { align: "center" }
    );

    // Address
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(
      "Shop No. 1/68, Ambalakaranpatti, Ulakaneri, MADURAI - 625 107.",
      pageWidth / 2,
      43,
      { align: "center" }
    );

    // Email
    doc.setTextColor(0, 0, 200);
    doc.text(
      "mailto : prabusangari690@gmail.com",
      pageWidth / 2,
      49,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);

    // Horizontal divider line under header
    doc.setLineWidth(0.6);
    doc.setDrawColor(0, 0, 0);
    doc.line(8, 53, pageWidth - 8, 53);

    // ─── CHALLAN META ROW ─────────────────────────────────────────────────────
    // Challan No. | Date
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const challanNo = `DC-${Date.now().toString().slice(-6)}`;
    const dateStr = new Date().toLocaleDateString("en-IN");

    doc.text(`Challan No. : ${challanNo}`, 12, 60);
    doc.text(`Date : ${dateStr}`, pageWidth - 12, 60, { align: "right" });

    // Thin divider
    doc.setLineWidth(0.3);
    doc.line(8, 63, pageWidth - 8, 63);

    // ─── CUSTOMER ROW ─────────────────────────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Name :", 12, 70);
    doc.setFont("helvetica", "normal");
    doc.text(customerName || "-", 50, 70);

    doc.setLineWidth(0.3);
    doc.line(8, 74, pageWidth - 8, 74);

    // ─── PRODUCT TABLE ────────────────────────────────────────────────────────
    const tableColumn = ["S.No", "Customer", "Product Name", "Quantity", "Date"];
    const tableRows = productsList.map((item) => [
      item.id,
      item.customerName,
      item.productName,
      item.quantity,
      item.created,
    ]);

    autoTable(doc, {
      startY: 77,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [20, 20, 20],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 45 },
        2: { cellWidth: 60 },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "center", cellWidth: 35 },
      },
      margin: { left: 8, right: 8 },
    });

    // ─── FOOTER ───────────────────────────────────────────────────────────────
    const footerY = pageHeight - 30;

    // Footer top line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(8, footerY - 4, pageWidth - 8, footerY - 4);

    // Left: Received line
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text("Received the goods in good condition", 12, footerY + 4);

    // Right: For Shree Aandavar Tooling
    doc.text("For Shree Aandavar Tooling", pageWidth - 12, footerY + 4, {
      align: "right",
    });

    // Signature labels
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);

    // Signature lines
    doc.setLineWidth(0.3);
    doc.setDrawColor(100, 100, 100);
    doc.line(12, footerY + 20, 65, footerY + 20);
    doc.line(pageWidth - 65, footerY + 20, pageWidth - 12, footerY + 20);

    doc.text("Party's Signature", 12, footerY + 25);
    doc.text("Signatory", pageWidth - 12, footerY + 25, { align: "right" });

    doc.save("Delivery_Challan.pdf");
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <div className="sales-header">
        <h1>Delivery Challan</h1>
        <p>Add multiple products for a single customer</p>
      </div>

      {/* Customer Section */}
      <div className="sales-form">
        <div className="sales-row">
          <div className="sales-group">
            <label>Customer Name</label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={productsList.length > 0}
            >
              <option value="">Select Customer</option>
              {customerOptions.map((customer, index) => (
                <option
                  key={index}
                  value={
                    typeof customer === "string"
                      ? customer
                      : customer.customer_name
                  }
                >
                  {typeof customer === "string"
                    ? customer
                    : customer.customer_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Section */}
        <div className="sales-row">
          <div className="sales-group">
            <label>Product Name</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            >
              <option value="">Select Product</option>
              {productOptions.map((product, index) => (
                <option
                  key={index}
                  value={
                    typeof product === "string"
                      ? product
                      : product.product_name
                  }
                >
                  {typeof product === "string"
                    ? product
                    : product.product_name}
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

        <button className="sales-pdf-btn" onClick={generatePDF}>
          Generate PDF
        </button>
      </div>

      {/* Table */}
      <div className="sales-table-card">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product Name</th>
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
              productsList.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
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
    </div>
  );
}

export default DeliveryChallan;





















// import React, { useState, useEffect } from "react";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";
// import "../CSS/Deliverychallan.css";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import api from "../api"; // Axios instance with baseURL

// function DeliveryChallan() {
//   const [customerName, setCustomerName] = useState("");
//   const [productName, setProductName] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [productsList, setProductsList] = useState([]);

//   const [productOptions, setProductOptions] = useState([]);
//   const [customerOptions, setCustomerOptions] = useState([]);

//   useEffect(() => {
//     fetchProducts();
//     fetchCustomers();
//     fetchDeliveryChallans();
//   }, []);

//   // ========== FETCH PRODUCTS ==========
//   const fetchProducts = async () => {
//     try {
//       const res = await api.get("/activeitems/activeitem");
//       if (res.data && res.data.data) {
//         setProductOptions(res.data.data);
//       }
//     } catch (error) {
//       console.error("Product API Error:", error);
//     }
//   };

//   // ========== FETCH CUSTOMERS ==========
//   const fetchCustomers = async () => {
//     try {
//       const res = await api.get("/custdrop/getdropCustomers");
//       if (res.data && res.data.data) {
//         setCustomerOptions(res.data.data);
//       }
//     } catch (error) {
//       console.error("Customer API Error:", error);
//     }
//   };

//   // ========== FETCH DELIVERY CHALLANS ==========
//   const fetchDeliveryChallans = async () => {
//     try {
//       const res = await api.get("/delivery/getDeliveryChallans");
//       console.log("Saved Delivery Challans:", res.data);
//     } catch (error) {
//       console.error("Delivery API Error:", error);
//     }
//   };

//   // ========== ADD PRODUCT TO TABLE ==========
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

//   // ========== SAVE DELIVERY CHALLAN TO DB ==========
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
//       console.log("Delivery Challan Saved");
//     } catch (error) {
//       console.error("Save Error:", error);
//     }
//   };

//   // ========== GENERATE PDF ==========
//   const generatePDF = async () => {
//     if (productsList.length === 0) {
//       alert("Add products first");
//       return;
//     }

//     // Save in DB
//     await saveDeliveryChallan();
//     fetchDeliveryChallans();

//     const doc = new jsPDF();

//     // Company Header
//     doc.setFontSize(18);
//     doc.text("Aandavar Tooling", 14, 15);

//     doc.setFontSize(11);
//     doc.text("Company Address: Madurai, Tamil Nadu, India", 14, 22);

//     doc.setFontSize(14);
//     doc.text("Delivery Challan", 14, 35);

//     doc.setFontSize(11);
//     doc.text(`Customer: ${customerName}`, 14, 42);
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 42);

//     // Table
//     const tableColumn = ["ID", "Customer", "Product", "Quantity", "Created"];
//     const tableRows = productsList.map((item) => [
//       item.id,
//       item.customerName,
//       item.productName,
//       item.quantity,
//       item.created,
//     ]);

//     autoTable(doc, {
//       startY: 50,
//       head: [tableColumn],
//       body: tableRows,
//     });

//     doc.save("Delivery_Challan.pdf");
//   };

//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Delivery Challan</h1>
//         <p>Add multiple products for a single customer</p>
//       </div>

//       {/* Customer Section */}
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

//         {/* Product Section */}
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

//       {/* Table */}
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