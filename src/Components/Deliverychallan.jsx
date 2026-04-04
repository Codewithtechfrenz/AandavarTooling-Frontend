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
  const safeWatermark = (doc, dataUrl, x, y, w, h) => {
    try {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.10, "fill-opacity": 0.10 }));
      doc.addImage(dataUrl, "JPEG", x, y, w, h);
      doc.restoreGraphicsState();
    } catch (e) {
      try {
        doc.saveGraphicsState();
        doc.setGState({ opacity: 0.10 });
        doc.addImage(dataUrl, "JPEG", x, y, w, h);
        doc.restoreGraphicsState();
      } catch (e2) {
        // Last resort: draw without opacity (still visible as logo)
        doc.addImage(dataUrl, "JPEG", x, y, w, h);
      }
    }
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

      const doc        = new jsPDF("p", "mm", "a4");
      const pageWidth  = doc.internal.pageSize.getWidth();   // 210
      const pageHeight = doc.internal.pageSize.getHeight();  // 297

      const bx           = 7;
      const by           = 7;
      const bw           = pageWidth  - 14;   // 196
      const bh           = pageHeight - 14;   // 283
      const borderBottom = by + bh;           // 290

      // ── Load SAT Logo (canvas re-encode → always clean JPEG) ────
      const { dataUrl: logoJpeg, ok: hasLogo } =
        await loadImageAsJpeg("/Assets/SAT Logo.png");

      // ══════════════════════════════════════════════════════
      // 1. WATERMARK  (first layer — behind everything)
      //    SAT Logo is roughly square 1:1
      //    Centred on full A4 page
      // ══════════════════════════════════════════════════════
      if (hasLogo) {
        const wmW = 110;
        const wmH = 110;
        const wmX = (pageWidth  - wmW) / 2;   // centre horizontally
        const wmY = (pageHeight - wmH) / 2;   // centre vertically
        safeWatermark(doc, logoJpeg, wmX, wmY, wmW, wmH);
      }

      // ══════════════════════════════════════════════════════
      // 2. PAGE BORDER
      // ══════════════════════════════════════════════════════
      doc.setDrawColor(0);
      doc.setLineWidth(0.7);
      doc.rect(bx, by, bw, bh);

      // ══════════════════════════════════════════════════════
      // 3. HEADER BOX  (height: 55)
      // Layout:
      //   [Logo 28×28 | top-left]  [Company name centred]  [DELIVERY CHALLAN box | top-right]
      // ══════════════════════════════════════════════════════
      const headerH = 55;
      doc.setLineWidth(0.4);
      doc.rect(bx, by, bw, headerH);

      // ── "DELIVERY CHALLAN" label box — top right ────────
      const dcBoxW = 55;
      const dcBoxH = 13;
      doc.rect(bx + bw - dcBoxW, by, dcBoxW, dcBoxH);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(
        "DELIVERY CHALLAN",
        bx + bw - dcBoxW / 2,
        by + 8.5,
        { align: "center" }
      );

      // ── Cell number (below DC box) ───────────────────────
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Cell : 9944130610",
        bx + bw - dcBoxW / 2,
        by + 18,
        { align: "center" }
      );

      // ── Logo — top LEFT of header ────────────────────────
      // SAT Logo is square; render at 28×28 mm with a small margin
      const logoSize = 28;
      const logoX    = bx + 4;
      const logoY    = by + (headerH - logoSize) / 2;  // vertically centred in header
      if (hasLogo) {
        doc.addImage(logoJpeg, "JPEG", logoX, logoY, logoSize, logoSize);
      }

      // ── Company name — centred horizontally on the page ──
      const centerX = pageWidth / 2;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("SHREE AANDAVAR TOOLING", centerX, by + 18, { align: "center" });

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "CNC Machine Service and Tooling & Job Work",
        centerX, by + 26, { align: "center" }
      );

      doc.setFontSize(8.5);
      doc.text(
        "5/520 D, Kabeer Nagar MasthanPatti Madurai - 20.",
        centerX, by + 33, { align: "center" }
      );
      doc.text(
        "mailto : prabusangari690@gmail.com",
        centerX, by + 39, { align: "center" }
      );

      // ── Date — bottom-right inside header ───────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(
        `Date : ${new Date().toLocaleDateString()}`,
        bx + bw - 5,
        by + headerH - 5,
        { align: "right" }
      );

      // ══════════════════════════════════════════════════════
      // 4. SUB-HEADER: Challan No + Customer
      // ══════════════════════════════════════════════════════
      const subY = by + headerH + 9;   // first text baseline
      const subBoxTop    = subY - 6;
      const subBoxBottom = subY + 7;

      doc.setLineWidth(0.3);
      doc.line(bx, subBoxTop,    bx + bw, subBoxTop);
      doc.line(bx, subBoxBottom, bx + bw, subBoxBottom);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Challan No :", bx + 5, subY + 2);
      doc.setFont("helvetica", "normal");
      doc.text(
        "DC-" + String(productsList.length).padStart(3, "0"),
        bx + 37, subY + 2
      );
      doc.setFont("helvetica", "bold");
      doc.text("To :", bx + bw / 2, subY + 2);
      doc.setFont("helvetica", "normal");
      doc.text(customerName, bx + bw / 2 + 12, subY + 2);

      // ══════════════════════════════════════════════════════
      // 5. PRODUCT TABLE
      // ══════════════════════════════════════════════════════
      autoTable(doc, {
        startY: subBoxBottom + 3,
        head: [["S.No", "Product Name", "Quantity", "Date"]],
        body: productsList.map((item, idx) => [
          idx + 1,
          item.productName,
          item.quantity,
          item.created,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [0, 100, 200],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: { fontSize: 9, halign: "center" },
        columnStyles: { 1: { halign: "left" } },
        margin: { left: bx + 2, right: bx + 2 },
        tableLineColor: [180, 180, 180],
        tableLineWidth: 0.3,
      });

      // ══════════════════════════════════════════════════════
      // 6. FOOTER — pinned inside border
      // ══════════════════════════════════════════════════════
      const footerDiv   = borderBottom - 28;
      const footerTextY = footerDiv    +  8;
      const sigLineY    = footerDiv    + 16;
      const sigLabelY   = sigLineY     +  6;

      doc.setLineWidth(0.4);
      doc.line(bx, footerDiv, bx + bw, footerDiv);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Received the goods in good condition", bx + 5, footerTextY);
      doc.text(
        "For Shree Aandavar Tooling",
        bx + bw - 5, footerTextY,
        { align: "right" }
      );

      doc.setLineWidth(0.3);
      doc.line(bx + 5,         sigLineY, bx + 68,      sigLineY);
      doc.line(bx + bw - 68,   sigLineY, bx + bw - 5,  sigLineY);

      doc.setFontSize(9);
      doc.text("Party's Signature", bx + 5, sigLabelY);
      doc.text("Signatory", bx + bw - 5, sigLabelY, { align: "right" });

      doc.save("Delivery_Challan.pdf");

    } catch (error) {
      console.error("PDF generation error:", error);
      alert("PDF Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // WEB PAGE — original design & structure completely unchanged
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
