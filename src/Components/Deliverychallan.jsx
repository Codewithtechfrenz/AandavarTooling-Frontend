import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/Deliverychallan.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";

function DeliveryChallan() {
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchDeliveryChallans();
  }, []);

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

  const fetchDeliveryChallans = async () => {
    try {
      const res = await api.get("/delivery/getDeliveryChallans");
      console.log("Saved Delivery Challans:", res.data);
    } catch (error) {
      console.error("Delivery API Error:", error);
    }
  };

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

  // ✅ FINAL PDF FUNCTION
  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    try {
      setLoading(true);

      await saveDeliveryChallan();
      fetchDeliveryChallans();

      const doc = new jsPDF();

      // ===== LOAD LOGO =====
      let logoLoaded = false;
      const logo = new Image();
      logo.src = "/Assets/SAT Logo.jpeg"; // ✅ your uploaded image

      await new Promise((resolve) => {
        logo.onload = () => {
          logoLoaded = true;
          resolve();
        };
        logo.onerror = resolve;
      });

      // ===== WATERMARK =====
      if (logoLoaded) {
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.addImage(logo, "JPEG", 40, 80, 120, 120);
        doc.setGState(new doc.GState({ opacity: 1 }));
      }

      // ===== HEADER =====
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("SHREE AANDAVAR TOOLING", 14, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("CNC Machine Service and Tooling & Job Work", 14, 22);
      doc.text(
        "Shop No. 1/68, Ambalakarampatti, Ulakaneri, Madurai - 625107",
        14,
        27
      );
      doc.text("Email: prabusangari690@gmail.com", 14, 32);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DELIVERY CHALLAN", 140, 15);

      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 25);
      doc.text("Challan No: DC-001", 140, 30);

      doc.line(10, 35, 200, 35);

      // ===== CUSTOMER =====
      doc.setFont("helvetica", "bold");
      doc.text("Customer:", 14, 45);

      doc.setFont("helvetica", "normal");
      doc.text(customerName, 14, 52);

      // ===== TABLE =====
      const tableColumn = ["ID", "Product", "Quantity", "Date"];
      const tableRows = productsList.map((item) => [
        item.id,
        item.productName,
        item.quantity,
        item.created,
      ]);

      autoTable(doc, {
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: 255,
        },
      });

      const finalY = doc.lastAutoTable.finalY || 100;

      // ===== FOOTER =====
      doc.line(10, finalY + 10, 200, finalY + 10);

      doc.setFont("helvetica", "normal");
      doc.text("Received the goods in good condition", 14, finalY + 20);
      doc.text("Party's Signature", 14, finalY + 35);

      doc.text("For Shree Aandavar Tooling", 130, finalY + 20);
      doc.text("Signatory", 150, finalY + 35);

      // ===== FOOTER LOGO (BOTTOM CENTER) =====
      if (logoLoaded) {
        doc.addImage(logo, "JPEG", 85, finalY + 45, 40, 40);
      }

      doc.save("Delivery_Challan.pdf");

    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <div className="sales-header">
        <h1>Delivery Challan</h1>
        <p>Add multiple products for a single customer</p>
      </div>

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
                <option key={index} value={typeof customer === "string" ? customer : customer.customer_name}>
                  {typeof customer === "string" ? customer : customer.customer_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sales-row">
          <div className="sales-group">
            <label>Product Name</label>
            <select value={productName} onChange={(e) => setProductName(e.target.value)}>
              <option value="">Select Product</option>
              {productOptions.map((product, index) => (
                <option key={index} value={typeof product === "string" ? product : product.product_name}>
                  {typeof product === "string" ? product : product.product_name}
                </option>
              ))}
            </select>
          </div>

          <div className="sales-group">
            <label>Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>

        <button className="sales-add-btn" onClick={addProduct}>
          Add Product
        </button>

        <button className="sales-pdf-btn" onClick={generatePDF} disabled={loading}>
          {loading ? "Generating PDF..." : "Generate PDF"}
        </button>
      </div>

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