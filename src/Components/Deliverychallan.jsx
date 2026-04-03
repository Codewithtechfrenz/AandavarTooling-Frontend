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

  // Helper: load an image and return a promise resolving to {img, loaded}
  const loadImage = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve({ img, loaded: true });
      img.onerror = () => resolve({ img: null, loaded: false });
    });

  // ✅ FINAL PDF FUNCTION — matches letterhead design
  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    try {
      setLoading(true);

      await saveDeliveryChallan();
      fetchDeliveryChallans();

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();   // 210
      const pageHeight = doc.internal.pageSize.getHeight(); // 297

      // ─── LOAD LOGO ────────────────────────────────────────────────
      const { img: logo, loaded: logoLoaded } = await loadImage(
        "/Assets/SAT Logo.jpeg"
      );

      // ─── WATERMARK (centered, very faint) ─────────────────────────
      if (logoLoaded) {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.07 }));
        // Center of page: (210/2 - 40, 297/2 - 40) for 80×80 image
        doc.addImage(logo, "JPEG", 65, 98, 80, 80);
        doc.restoreGraphicsState();
      }

      // ─── OUTER BORDER ─────────────────────────────────────────────
      doc.setDrawColor(0);
      doc.setLineWidth(0.8);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

      // ─── HEADER BOX (top-right: DELIVERY CHALLAN + Cell) ──────────
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      // Box for "DELIVERY CHALLAN"
      doc.rect(130, 10, 72, 10);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("DELIVERY CHALLAN", 166, 17, { align: "center" });

      // Cell number top-right (outside box)
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Cell : 9944130610", 166, 26, { align: "center" });

      // ─── LOGO (top-left) ──────────────────────────────────────────
      if (logoLoaded) {
        doc.addImage(logo, "JPEG", 10, 10, 22, 22);
      }

      // ─── COMPANY NAME ─────────────────────────────────────────────
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      // Italic-style: jsPDF supports "bolditalic"
      doc.setFont("times", "bolditalic");
      doc.text("Shree Aandavar Tooling", pageWidth / 2, 22, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "CNC Machine Service and Tooling & Job Work",
        pageWidth / 2,
        29,
        { align: "center" }
      );

      doc.setFontSize(9);
      doc.text(
        "Shop No. 1/68, Ambalakarampatti, Ulakaneri, MADURAI - 625 107.",
        pageWidth / 2,
        34,
        { align: "center" }
      );

      doc.text(
        "mailto : prabusangari690@gmail.com",
        38,
        40
      );

      doc.text(
        `Date : ${new Date().toLocaleDateString("en-IN")}`,
        148,
        40
      );

      // ─── HORIZONTAL DIVIDER ───────────────────────────────────────
      doc.setLineWidth(0.8);
      doc.line(8, 43, pageWidth - 8, 43);
      doc.setLineWidth(0.3);
      doc.line(8, 45, pageWidth - 8, 45);

      // ─── CHALLAN NO & CUSTOMER ────────────────────────────────────
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Challan No :", 12, 53);
      doc.setFont("helvetica", "normal");
      doc.text("DC-" + String(productsList.length).padStart(3, "0"), 40, 53);

      doc.setFont("helvetica", "bold");
      doc.text("To :", 12, 60);
      doc.setFont("helvetica", "normal");
      doc.text(customerName, 22, 60);

      // ─── TABLE ────────────────────────────────────────────────────
      const tableColumns = [
        { header: "S.No", dataKey: "id" },
        { header: "Product Name", dataKey: "productName" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Date", dataKey: "created" },
      ];

      const tableRows = productsList.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        created: item.created,
      }));

      autoTable(doc, {
        startY: 65,
        columns: tableColumns,
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          halign: "center",
        },
        columnStyles: {
          id: { cellWidth: 20 },
          productName: { cellWidth: 90, halign: "left" },
          quantity: { cellWidth: 35 },
          created: { cellWidth: 40 },
        },
        margin: { left: 8, right: 8 },
      });

      const tableEndY = doc.lastAutoTable.finalY || 120;

      // ─── SIGNATURE SECTION (always near bottom) ───────────────────
      // Ensure signatures are always at the bottom regardless of table size
      const signatureY = Math.max(tableEndY + 20, pageHeight - 55);

      doc.setLineWidth(0.4);
      doc.line(8, signatureY, pageWidth - 8, signatureY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Left side
      doc.text("Received the goods in good condition", 12, signatureY + 8);

      // Right side
      doc.text("For Shree Aandavar Tooling", pageWidth - 12, signatureY + 8, {
        align: "right",
      });

      // Signature lines
      const sigLineY = signatureY + 28;
      doc.setLineWidth(0.3);
      doc.line(12, sigLineY, 70, sigLineY);         // left signature line
      doc.line(pageWidth - 70, sigLineY, pageWidth - 12, sigLineY); // right signature line

      doc.setFontSize(9);
      doc.text("Party's Signature", 12, sigLineY + 5);
      doc.text("Signatory", pageWidth - 12, sigLineY + 5, { align: "right" });

      // ─── BOTTOM LOGO (centered at very bottom) ────────────────────
      if (logoLoaded) {
        const logoW = 28;
        const logoH = 28;
        const logoX = (pageWidth - logoW) / 2;
        const logoY = pageHeight - 40;
        doc.addImage(logo, "JPEG", logoX, logoY, logoW, logoH);
      }

      // ─── BOTTOM BORDER LINE ───────────────────────────────────────
      doc.setLineWidth(0.5);
      doc.line(8, pageHeight - 10, pageWidth - 8, pageHeight - 10);

      doc.save("Delivery_Challan.pdf");
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  // ─── WEB PAGE (unchanged) ────────────────────────────────────────
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
            />
          </div>
        </div>

        <button className="sales-add-btn" onClick={addProduct}>
          Add Product
        </button>

        <button
          className="sales-pdf-btn"
          onClick={generatePDF}
          disabled={loading}
        >
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