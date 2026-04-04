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

  // ─────────────────────────────────────────────────────────────
  // loadImageAsJpeg — re-encodes any image to clean JPEG via canvas
  // ─────────────────────────────────────────────────────────────
  const loadImageAsJpeg = (url) =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width  = img.naturalWidth  || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), ok: true });
        } catch (e) {
          console.warn("Canvas encode failed:", e);
          resolve({ dataUrl: null, ok: false });
        }
      };
      img.onerror = (e) => {
        console.warn("Image load failed:", url, e);
        resolve({ dataUrl: null, ok: false });
      };
      img.src = url;
    });

  // ─────────────────────────────────────────────────────────────
  // safeWatermark — opacity watermark with graceful fallback
  // ─────────────────────────────────────────────────────────────
  const safeWatermark = (doc, dataUrl, x, y, w, h, opacity) => {
    try {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: opacity, "fill-opacity": opacity }));
      doc.addImage(dataUrl, "JPEG", x, y, w, h);
      doc.restoreGraphicsState();
    } catch (e) {
      try {
        doc.saveGraphicsState();
        doc.setGState({ opacity: opacity });
        doc.addImage(dataUrl, "JPEG", x, y, w, h);
        doc.restoreGraphicsState();
      } catch (e2) {
        // silent — skip watermark if GState unsupported
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // drawCornerMarks — gold precision crop-mark corners
  // ─────────────────────────────────────────────────────────────
  const drawCornerMarks = (doc, x, y, w, h, len) => {
    doc.setDrawColor(201, 168, 76);   // GOLD — explicit values, no spread
    doc.setLineWidth(0.7);
    doc.line(x,     y,     x + len, y);
    doc.line(x,     y,     x,       y + len);
    doc.line(x + w, y,     x+w-len, y);
    doc.line(x + w, y,     x + w,   y + len);
    doc.line(x,     y + h, x + len, y + h);
    doc.line(x,     y + h, x,       y + h - len);
    doc.line(x + w, y + h, x+w-len, y + h);
    doc.line(x + w, y + h, x + w,   y + h - len);
  };

  // ─────────────────────────────────────────────────────────────
  // generatePDF
  // ─────────────────────────────────────────────────────────────
  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    try {
      setLoading(true);
      await saveDeliveryChallan();
      fetchDeliveryChallans();

      const doc       = new jsPDF("p", "mm", "a4");
      const PW        = doc.internal.pageSize.getWidth();   // 210
      const PH        = doc.internal.pageSize.getHeight();  // 297

      // ── Load SAT Logo ────────────────────────────────────
      const { dataUrl: logoJpeg, ok: hasLogo } =
        await loadImageAsJpeg("/Assets/SAT Logo.png");

      // ══════════════════════════════════════════════════════
      // 0. PAGE BACKGROUND — warm off-white
      // ══════════════════════════════════════════════════════
      doc.setFillColor(247, 244, 239);
      doc.rect(0, 0, PW, PH, "F");

      // ══════════════════════════════════════════════════════
      // 1. WATERMARK — SAT Logo centred, very faint
      // ══════════════════════════════════════════════════════
      if (hasLogo) {
        safeWatermark(doc, logoJpeg, (PW - 120) / 2, (PH - 120) / 2, 120, 120, 0.07);
      }

      // ══════════════════════════════════════════════════════
      // 2. HEADER BAND — full-width navy (0 → 70 mm)
      // ══════════════════════════════════════════════════════
      doc.setFillColor(13, 27, 42);           // NAVY
      doc.rect(0, 0, PW, 70, "F");

      // left gold vertical accent bar
      doc.setFillColor(201, 168, 76);         // GOLD
      doc.rect(0, 0, 5, 70, "F");

      // gold bottom stripe
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 66, PW, 4, "F");

      // ── Logo: white circle + gold ring ───────────────────
      if (hasLogo) {
        doc.setFillColor(255, 255, 255);
        doc.circle(30, 35, 23, "F");
        doc.setDrawColor(201, 168, 76);
        doc.setLineWidth(0.9);
        doc.circle(30, 35, 23, "S");
        doc.addImage(logoJpeg, "JPEG", 9, 14, 42, 42);
      }

      // ── DELIVERY CHALLAN badge — top right ───────────────
      doc.setFillColor(201, 168, 76);
      doc.roundedRect(147, 7, 58, 20, 3, 3, "F");
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 42);           // NAVY text on gold badge
      doc.text("DELIVERY CHALLAN", 176, 20, { align: "center" });

      // ── Company name — centred right of logo ─────────────
      const cx = (55 + PW) / 2;

      doc.setFontSize(19);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);        // WHITE
      doc.text("SHREE AANDAVAR TOOLING", cx, 26, { align: "center" });

      // gold hairline under company name
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.5);
      doc.line(60, 30, PW - 10, 30);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);        // STEEL
      doc.text("CNC Machine Service  ·  Tooling  ·  Job Work", cx, 37, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(212, 216, 222);        // MIDGRY
      doc.text("5/520 D, Kabeer Nagar MasthanPatti, Madurai - 20.", cx, 44, { align: "center" });
      doc.text("prabusangari690@gmail.com   |   Cell : 9944130610",  cx, 51, { align: "center" });

      // ══════════════════════════════════════════════════════
      // 3. META STRIP — deeper navy (70 → 98 mm)
      // ══════════════════════════════════════════════════════
      doc.setFillColor(22, 48, 78);           // DKNAVY
      doc.rect(0, 70, PW, 28, "F");

      // vertical gold dividers
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.3);
      doc.line(52,  74, 52,  95);
      doc.line(132, 74, 132, 95);
      doc.line(172, 74, 172, 95);

      // ── Pill 1: Challan No (gold value) ──────────────────
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);
      doc.text("CHALLAN NO.", 8, 79);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(201, 168, 76);
      doc.text("DC-" + String(productsList.length).padStart(3, "0"), 8, 90);

      // ── Pill 2: Dispatched To (white value) ──────────────
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);
      doc.text("DISPATCHED TO", 58, 79);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text((customerName || "-").toUpperCase(), 58, 90, { maxWidth: 70 });

      // ── Pill 3: Date of Issue (white value) ──────────────
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);
      doc.text("DATE OF ISSUE", 138, 79);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        }),
        138, 90
      );

      // ── Pill 4: Total Items (gold value) ─────────────────
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);
      doc.text("TOTAL ITEMS", 178, 79);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(201, 168, 76);
      doc.text(String(productsList.length), 178, 90);

      // ══════════════════════════════════════════════════════
      // 4. SECTION LABEL + DECORATIVE RULES
      // ══════════════════════════════════════════════════════
      const secY = 106;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(138, 155, 176);
      doc.text("ITEMS DISPATCHED", 12, secY);

      doc.setFillColor(201, 168, 76);
      doc.rect(12, secY + 2, PW - 24, 1.2, "F");

      doc.setFillColor(212, 216, 222);
      doc.rect(12, secY + 3.8, PW - 24, 0.3, "F");

      // ══════════════════════════════════════════════════════
      // 5. PRODUCT TABLE
      // ══════════════════════════════════════════════════════
      autoTable(doc, {
        startY: secY + 8,
        head: [["S.NO", "PRODUCT NAME / DESCRIPTION", "QTY", "DATE"]],
        body: productsList.map((item, idx) => [
          String(idx + 1).padStart(2, "0"),
          item.productName,
          item.quantity,
          item.created,
        ]),
        theme: "plain",
        headStyles: {
          fillColor: [13, 27, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
          halign: "center",
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
        },
        bodyStyles: {
          fontSize: 9,
          halign: "center",
          textColor: [30, 30, 50],
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
          lineColor: [212, 216, 222],
          lineWidth: 0.25,
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { halign: "left", cellWidth: 112 },
          2: { cellWidth: 28 },
          3: { cellWidth: 34 },
        },
        alternateRowStyles: { fillColor: [236, 239, 245] },
        margin: { left: 12, right: 12 },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            doc.setFillColor(201, 168, 76);
            doc.rect(data.cell.x, data.cell.y, 1.5, data.cell.height, "F");
          }
        },
      });

      const tableEnd = doc.lastAutoTable.finalY + 7;

      // ══════════════════════════════════════════════════════
      // 6. NOTE BOX
      // ══════════════════════════════════════════════════════
      doc.setFillColor(235, 238, 245);
      doc.roundedRect(12, tableEnd, PW - 24, 18, 2, 2, "F");
      doc.setDrawColor(138, 155, 176);
      doc.setLineWidth(0.2);
      doc.roundedRect(12, tableEnd, PW - 24, 18, 2, 2, "S");

      doc.setFillColor(201, 168, 76);
      doc.roundedRect(12, tableEnd, 3, 18, 1, 1, "F");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 42);
      doc.text("NOTE", 20, tableEnd + 7);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 55, 75);
      doc.text(
        "This delivery challan is not a tax invoice. Goods once dispatched will not be taken back without prior written intimation.",
        20, tableEnd + 13,
        { maxWidth: PW - 38 }
      );

      // ══════════════════════════════════════════════════════
      // 7. FOOTER BAND — pinned to bottom
      // ══════════════════════════════════════════════════════
      const fbY = PH - 42;

      doc.setFillColor(201, 168, 76);
      doc.rect(0, fbY, PW, 1.5, "F");

      doc.setFillColor(13, 27, 42);
      doc.rect(0, fbY + 1.5, PW, 40.5, "F");

      // ── Signature boxes ───────────────────────────────────
      const sbW = 72;
      const sbH = 20;
      const sbY = fbY + 8;

      // left — receiver
      doc.setFillColor(22, 48, 78);
      doc.roundedRect(12, sbY, sbW, sbH, 2, 2, "F");
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.4);
      doc.roundedRect(12, sbY, sbW, sbH, 2, 2, "S");
      doc.setDrawColor(138, 155, 176);
      doc.setLineWidth(0.3);
      doc.line(18, sbY + 13, 78, sbY + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);
      doc.text("RECEIVER'S SIGNATURE", 48, sbY + 18, { align: "center" });

      // centre text
      doc.setFontSize(8);
      doc.setTextColor(138, 155, 176);
      doc.text("Received goods in good condition", PW / 2, sbY + 9,  { align: "center" });
      doc.setFontSize(7);
      doc.setTextColor(60, 80, 110);
      doc.text("(subject to inspection)",          PW / 2, sbY + 15, { align: "center" });

      // right — company
      doc.setFillColor(22, 48, 78);
      doc.roundedRect(PW - 12 - sbW, sbY, sbW, sbH, 2, 2, "F");
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.4);
      doc.roundedRect(PW - 12 - sbW, sbY, sbW, sbH, 2, 2, "S");
      doc.setDrawColor(138, 155, 176);
      doc.setLineWidth(0.3);
      doc.line(PW - 12 - sbW + 6, sbY + 13, PW - 18, sbY + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(138, 155, 176);
      doc.text(
        "FOR SHREE AANDAVAR TOOLING",
        PW - 12 - sbW / 2, sbY + 18,
        { align: "center" }
      );

      // tagline
      doc.setFontSize(6.5);
      doc.setTextColor(60, 80, 110);
      doc.text(
        "Shree Aandavar Tooling  ·  Madurai  ·  9944130610  ·  prabusangari690@gmail.com",
        PW / 2, PH - 3.5,
        { align: "center" }
      );

      // ══════════════════════════════════════════════════════
      // 8. GOLD CORNER REGISTRATION MARKS
      // ══════════════════════════════════════════════════════
      drawCornerMarks(doc, 4, 4, PW - 8, PH - 8, 9);

      doc.save("Delivery_Challan.pdf");

    } catch (error) {
      console.error("PDF generation error:", error);
      alert("PDF Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // WEB PAGE — original structure completely unchanged
  // ═══════════════════════════════════════════════════════════
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
