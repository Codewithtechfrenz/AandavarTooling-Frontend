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
      if (res.data && res.data.data) setProductOptions(res.data.data);
    } catch (error) {
      console.error("Product API Error:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/custdrop/getdropCustomers");
      if (res.data && res.data.data) setCustomerOptions(res.data.data);
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
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  // ✅ RELIABLE image loader — fetch → blob → base64
  // Works consistently in jsPDF / React regardless of browser
  const getBase64FromUrl = async (url) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // "data:image/png;base64,..."
        reader.onerror  = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Image load failed:", url, err);
      return null;
    }
  };

  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    try {
      setLoading(true);
      await saveDeliveryChallan();
      fetchDeliveryChallans();

      const doc        = new jsPDF();
      const pageWidth  = doc.internal.pageSize.getWidth();   // 210
      const pageHeight = doc.internal.pageSize.getHeight();  // 297

      // Border constants
      const bx           = 7;
      const by           = 7;
      const bw           = pageWidth  - 14;   // 196
      const bh           = pageHeight - 14;   // 283
      const borderBottom = by + bh;           // 290

      // ── Load logo as base64 (guaranteed to work) ──────────
      // Logo is in /public/AndavarLogo2.png
      const logoBase64 = await getBase64FromUrl("/AndavarLogo2.png");
      const hasLogo    = !!logoBase64;

      // ══════════════════════════════════════════════════════
      // LAYER 1 — WATERMARK  (drawn first → behind everything)
      //   Centred on the full A4 page
      //   Logo ratio ≈ 1.8 : 1  (landscape)
      // ══════════════════════════════════════════════════════
      if (hasLogo) {
        const wmW = 140;
        const wmH = 78;                              // 140 / 1.8
        const wmX = (pageWidth  - wmW) / 2;         // 35 — h-centred
        const wmY = (pageHeight - wmH) / 2;         // 109.5 — v-centred
        doc.setGState(new doc.GState({ opacity: 0.10 }));
        doc.addImage(logoBase64, "PNG", wmX, wmY, wmW, wmH);
        doc.setGState(new doc.GState({ opacity: 1.0 }));
      }

      // ══════════════════════════════════════════════════════
      // LAYER 2 — PAGE BORDER
      // ══════════════════════════════════════════════════════
      doc.setLineWidth(0.7);
      doc.rect(bx, by, bw, bh);

      // ══════════════════════════════════════════════════════
      // LAYER 3 — HEADER BOX  (height 50)
      // ══════════════════════════════════════════════════════
      doc.setLineWidth(0.4);
      doc.rect(bx, by, bw, 50);

      // "DELIVERY CHALLAN" boxed label — top right
      doc.rect(143, by, 57, 13);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DELIVERY CHALLAN", 171.5, 15.5, { align: "center" });

      // Cell number below label
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Cell : 9944130610", 171.5, 24, { align: "center" });

      // ── AndavarLogo2 — TOP LEFT of header ──
      // Logo is landscape; render 56w × 31h to fit header height neatly
      if (hasLogo) {
        doc.addImage(logoBase64, "PNG", 9, 12, 56, 31);
      }

      // ── Company name (x=69 clears the 56-wide logo) ──
      doc.setFontSize(19);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Shree Aandavar Tooling", 69, 22);

      // Tagline
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("CNC Machine Service and Tooling & Job Work", 69, 29);

      // Address
      doc.setFontSize(9);
      doc.text(
        "Shop No. 1/68, Ambalakaranpatti, Ulakaneri, MADURAI - 625 107.",
        69, 35
      );

      // Email
      doc.text("mailto : prabusangari690@gmail.com", 69, 41);

      // Date (right side, same row as email)
      doc.setFont("helvetica", "bold");
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 143, 48);

      // ══════════════════════════════════════════════════════
      // LAYER 4 — SUB-HEADER: Challan No + Customer
      // ══════════════════════════════════════════════════════
      const subY = 62;
      doc.setLineWidth(0.3);
      doc.line(bx, subY - 3,  bx + bw, subY - 3);
      doc.line(bx, subY + 9,  bx + bw, subY + 9);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Challan No :", 12, subY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "DC-" + String(productsList.length).padStart(3, "0"),
        44, subY + 5
      );

      doc.setFont("helvetica", "bold");
      doc.text("To :", 100, subY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(customerName, 112, subY + 5);

      // ══════════════════════════════════════════════════════
      // LAYER 5 — PRODUCT TABLE
      // ══════════════════════════════════════════════════════
      const tableColumn = ["S.No", "Product Name", "Quantity", "Date"];
      const tableRows   = productsList.map((item, idx) => [
        idx + 1,
        item.productName,
        item.quantity,
        item.created,
      ]);

      autoTable(doc, {
        startY: subY + 12,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [0, 100, 200],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          halign: "center",
        },
        columnStyles: { 1: { halign: "left" } },
        margin: { left: 9, right: 9 },
        tableLineColor: [180, 180, 180],
        tableLineWidth: 0.3,
      });

      // ══════════════════════════════════════════════════════
      // LAYER 6 — FOOTER  (all content guaranteed inside border)
      //
      //  borderBottom = 290
      //  footerDiv    = 262  ← divider line
      //  footerTextY  = 270  ← "Received..." / "For Shree..."
      //  sigLineY     = 278  ← drawn signature lines
      //  sigLabelY    = 284  ← "Party's Signature" / "Signatory"
      // ══════════════════════════════════════════════════════
      const footerDiv   = borderBottom - 28;   // 262
      const footerTextY = footerDiv    +  8;   // 270
      const sigLineY    = footerDiv    + 16;   // 278
      const sigLabelY   = sigLineY     +  6;   // 284

      // Divider above footer
      doc.setLineWidth(0.4);
      doc.line(bx, footerDiv, bx + bw, footerDiv);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // Footer text
      doc.text("Received the goods in good condition", 12, footerTextY);
      doc.text(
        "For Shree Aandavar Tooling",
        bx + bw - 5, footerTextY,
        { align: "right" }
      );

      // Signature lines
      doc.setLineWidth(0.3);
      doc.line(12,             sigLineY, 75,           sigLineY);
      doc.line(bx + bw - 68,  sigLineY, bx + bw - 5,  sigLineY);

      // Signature labels
      doc.setFontSize(9);
      doc.text("Party's Signature", 12, sigLabelY);
      doc.text("Signatory", bx + bw - 5, sigLabelY, { align: "right" });

      doc.save("Delivery_Challan.pdf");
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // WEB PAGE — original design & structure completely unchanged
  // ══════════════════════════════════════════════════════════
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