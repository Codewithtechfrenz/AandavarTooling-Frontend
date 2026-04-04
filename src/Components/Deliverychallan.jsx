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
  // loadImageAsJpeg
  // Loads ANY image (PNG / JPEG / WEBP) from a URL and re-encodes
  // it as JPEG via an HTML canvas. This avoids jsPDF's "wrong PNG
  // signature" error caused by files that have the wrong extension
  // or non-standard PNG metadata.
  // Returns: { dataUrl: "data:image/jpeg;base64,...", ok: true }
  //       or { dataUrl: null, ok: false }  on failure.
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

          // White background so transparency doesn't go black in JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          resolve({ dataUrl, ok: true });
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
  // safeWatermark — tries opacity via saveGraphicsState, falls back
  // gracefully so the PDF never crashes on older jsPDF builds.
  // ─────────────────────────────────────────────────────────────
  const safeWatermark = (doc, dataUrl, x, y, w, h, opacity = 0.08) => {
    try {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity, "fill-opacity": opacity }));
      doc.addImage(dataUrl, "JPEG", x, y, w, h);
      doc.restoreGraphicsState();
    } catch (e) {
      try {
        doc.saveGraphicsState();
        doc.setGState({ opacity });
        doc.addImage(dataUrl, "JPEG", x, y, w, h);
        doc.restoreGraphicsState();
      } catch (e2) {
        // silent — no watermark if jsPDF version doesn't support GState
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // drawCornerMarks — gold precision crop-mark style corners
  // ─────────────────────────────────────────────────────────────
  const drawCornerMarks = (doc, x, y, w, h, len, color) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.7);
    // top-left
    doc.line(x,     y,     x + len, y);
    doc.line(x,     y,     x,       y + len);
    // top-right
    doc.line(x + w, y,     x+w-len, y);
    doc.line(x + w, y,     x + w,   y + len);
    // bottom-left
    doc.line(x,     y + h, x + len, y + h);
    doc.line(x,     y + h, x,       y + h - len);
    // bottom-right
    doc.line(x + w, y + h, x+w-len, y + h);
    doc.line(x + w, y + h, x + w,   y + h - len);
  };

  // ─────────────────────────────────────────────────────────────
  // generatePDF  — Industrial Luxury design
  //
  // Palette:
  //   NAVY   #0D1B2A  [13,  27,  42]
  //   GOLD   #C9A84C  [201, 168, 76]
  //   STEEL  #8A9BB0  [138, 155, 176]
  //   OFFWHT #F7F4EF  [247, 244, 239]
  //   MIDGRY #D4D8DE  [212, 216, 222]
  //   DKNAVY #16304E  [22,  48,  78]
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

      const doc        = new jsPDF("p", "mm", "a4");
      const pageWidth  = doc.internal.pageSize.getWidth();   // 210
      const pageHeight = doc.internal.pageSize.getHeight();  // 297

      // ── Colour palette ───────────────────────────────────
      const NAVY   = [13,  27,  42];
      const GOLD   = [201, 168, 76];
      const STEEL  = [138, 155, 176];
      const OFFWHT = [247, 244, 239];
      const MIDGRY = [212, 216, 222];
      const DKNAVY = [22,  48,  78];
      const WHITE  = [255, 255, 255];
      const BLACK  = [0,   0,   0];

      // ── Load SAT Logo ────────────────────────────────────
      const { dataUrl: logoJpeg, ok: hasLogo } =
        await loadImageAsJpeg("/Assets/SAT Logo.png");

      // ══════════════════════════════════════════════════════
      // 0. PAGE BACKGROUND — warm off-white
      // ══════════════════════════════════════════════════════
      doc.setFillColor(...OFFWHT);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // ══════════════════════════════════════════════════════
      // 1. WATERMARK — SAT Logo, centred, very faint
      // ══════════════════════════════════════════════════════
      if (hasLogo) {
        const wmW = 120;
        const wmH = 120;
        const wmX = (pageWidth  - wmW) / 2;
        const wmY = (pageHeight - wmH) / 2;
        safeWatermark(doc, logoJpeg, wmX, wmY, wmW, wmH, 0.07);
      }

      // ══════════════════════════════════════════════════════
      // 2. HEADER BAND — full-width navy block (0 → 70 mm)
      // ══════════════════════════════════════════════════════
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageWidth, 70, "F");

      // left gold vertical accent bar
      doc.setFillColor(...GOLD);
      doc.rect(0, 0, 5, 70, "F");

      // gold bottom stripe closing the header
      doc.setFillColor(...GOLD);
      doc.rect(0, 66, pageWidth, 4, "F");

      // ── Logo: white circle + gold ring + SAT image ───────
      if (hasLogo) {
        doc.setFillColor(...WHITE);
        doc.circle(30, 35, 23, "F");
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.9);
        doc.circle(30, 35, 23, "S");
        doc.addImage(logoJpeg, "JPEG", 9, 14, 42, 42);
      }

      // ── "DELIVERY CHALLAN" badge — top right ─────────────
      doc.setFillColor(...GOLD);
      doc.roundedRect(147, 7, 58, 20, 3, 3, "F");
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text("DELIVERY CHALLAN", 176, 20, { align: "center" });

      // ── Company name — centred in space right of logo ────
      const cx = (55 + pageWidth) / 2;  // centre of remaining space

      doc.setFontSize(19);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text("SHREE AANDAVAR TOOLING", cx, 26, { align: "center" });

      // gold hairline rule under company name
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.5);
      doc.line(60, 30, pageWidth - 10, 30);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...STEEL);
      // doc.text("CNC Machine Service  ·  Tooling  ·  Job Work", cx, 37, { align: "center" });
      doc.setFontSize(8);
      doc.setTextColor(...MIDGRY);
      doc.text("5/520 D, Kabeer Nagar MasthanPatti, Madurai - 20.", cx, 44, { align: "center" });
      doc.text("prabusangari690@gmail.com   |   Cell : 9944130610",  cx, 51, { align: "center" });

      // ══════════════════════════════════════════════════════
      // 3. META STRIP — deeper navy (70 → 98 mm)
      //    Four data pills: Challan No · To · Date · Items
      // ══════════════════════════════════════════════════════
      doc.setFillColor(...DKNAVY);
      doc.rect(0, 70, pageWidth, 28, "F");

      // vertical gold dividers
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      [52, 132, 172].forEach((xd) => {
        doc.line(xd, 74, xd, 95);
      });

      // helper: gold-value pill
      const pillGold = (label, value, x, maxW) => {
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...STEEL);
        doc.text(label, x, 79, { maxWidth: maxW });
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GOLD);
        doc.text(value, x, 90, { maxWidth: maxW });
      };

      // helper: white-value pill
      const pillWhite = (label, value, x, maxW) => {
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...STEEL);
        doc.text(label, x, 79, { maxWidth: maxW });
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...WHITE);
        doc.text(value, x, 90, { maxWidth: maxW });
      };

      pillGold(
        "CHALLAN NO.",
        "DC-" + String(productsList.length).padStart(3, "0"),
        8, 42
      );
      pillWhite(
        "DISPATCHED TO",
        (customerName || "—").toUpperCase(),
        58, 72
      );
      pillWhite(
        "DATE OF ISSUE",
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        }),
        138, 32
      );
      pillGold(
        "TOTAL ITEMS",
        String(productsList.length),
        178, 28
      );

      // ══════════════════════════════════════════════════════
      // 4. SECTION LABEL + DECORATIVE RULES
      // ══════════════════════════════════════════════════════
      const secY = 106;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...STEEL);
      doc.text("ITEMS DISPATCHED", 12, secY);

      // bold gold rule
      doc.setFillColor(...GOLD);
      doc.rect(12, secY + 2, pageWidth - 24, 1.2, "F");
      // thin grey underline
      doc.setFillColor(...MIDGRY);
      doc.rect(12, secY + 3.8, pageWidth - 24, 0.3, "F");

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
          fillColor: NAVY,
          textColor: WHITE,
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
          lineColor: MIDGRY,
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
        // gold left accent bar on every body row
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            doc.setFillColor(...GOLD);
            doc.rect(data.cell.x, data.cell.y, 1.5, data.cell.height, "F");
          }
        },
      });

      const tableEnd = doc.lastAutoTable.finalY + 7;

      // ══════════════════════════════════════════════════════
      // 6. NOTE BOX
      // ══════════════════════════════════════════════════════
      doc.setFillColor(235, 238, 245);
      doc.roundedRect(12, tableEnd, pageWidth - 24, 18, 2, 2, "F");
      doc.setDrawColor(...STEEL);
      doc.setLineWidth(0.2);
      doc.roundedRect(12, tableEnd, pageWidth - 24, 18, 2, 2, "S");

      // gold left accent on note box
      doc.setFillColor(...GOLD);
      doc.roundedRect(12, tableEnd, 3, 18, 1, 1, "F");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text("NOTE", 20, tableEnd + 7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor([50, 55, 75]);
      doc.text(
        "This delivery challan is not a tax invoice. Goods once dispatched will not be taken back without prior written intimation.",
        20, tableEnd + 13, { maxWidth: pageWidth - 38 }
      );

      // ══════════════════════════════════════════════════════
      // 7. FOOTER BAND — pinned to page bottom
      // ══════════════════════════════════════════════════════
      const fbY = pageHeight - 42;

      // gold top divider line
      doc.setFillColor(...GOLD);
      doc.rect(0, fbY, pageWidth, 1.5, "F");

      // navy footer background
      doc.setFillColor(...NAVY);
      doc.rect(0, fbY + 1.5, pageWidth, 40.5, "F");

      // ── two signature boxes ───────────────────────────────
      const sbW = 72;
      const sbH = 20;
      const sbY = fbY + 8;

      // left — receiver's signature box
      doc.setFillColor(...DKNAVY);
      doc.roundedRect(12, sbY, sbW, sbH, 2, 2, "F");
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.roundedRect(12, sbY, sbW, sbH, 2, 2, "S");
      doc.setDrawColor(...STEEL);
      doc.setLineWidth(0.3);
      doc.line(18, sbY + 13, 78, sbY + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...STEEL);
      doc.text("RECEIVER'S SIGNATURE", 48, sbY + 18, { align: "center" });

      // centre acknowledgement text
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...STEEL);
      doc.text("Received goods in good condition", pageWidth / 2, sbY + 9,  { align: "center" });
      doc.setFontSize(7);
      doc.setTextColor([60, 80, 110]);
      doc.text("(subject to inspection)",          pageWidth / 2, sbY + 15, { align: "center" });

      // right — company signature box
      doc.setFillColor(...DKNAVY);
      doc.roundedRect(pageWidth - 12 - sbW, sbY, sbW, sbH, 2, 2, "F");
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.roundedRect(pageWidth - 12 - sbW, sbY, sbW, sbH, 2, 2, "S");
      doc.setDrawColor(...STEEL);
      doc.setLineWidth(0.3);
      doc.line(pageWidth - 12 - sbW + 6, sbY + 13, pageWidth - 18, sbY + 13);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...STEEL);
      doc.text(
        "FOR SHREE AANDAVAR TOOLING",
        pageWidth - 12 - sbW / 2, sbY + 18,
        { align: "center" }
      );

      // footer tagline
      doc.setFontSize(6.5);
      doc.setTextColor([60, 80, 110]);
      doc.text(
        "Shree Aandavar Tooling  ·  Madurai  ·  9944130610  ·  prabusangari690@gmail.com",
        pageWidth / 2, pageHeight - 3.5,
        { align: "center" }
      );

      // ══════════════════════════════════════════════════════
      // 8. GOLD CORNER REGISTRATION MARKS
      // ══════════════════════════════════════════════════════
      drawCornerMarks(doc, 4, 4, pageWidth - 8, pageHeight - 8, 9, GOLD);

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
