import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/Deliverychallan.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";

// ✅ IMPORT LOGO FROM LOCAL PATH
import logo from "./AndavarLogo2.png";

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

  // ✅ LOAD IMAGE FROM IMPORTED PATH
  const loadImageAsJpeg = (src) =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          resolve({ dataUrl, ok: true });
        } catch {
          resolve({ dataUrl: null, ok: false });
        }
      };

      img.onerror = () => resolve({ dataUrl: null, ok: false });

      img.src = src; // ✅ USING IMPORTED LOGO HERE
    });

  const safeWatermark = (doc, dataUrl, x, y, w, h) => {
    try {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.addImage(dataUrl, "JPEG", x, y, w, h);
      doc.restoreGraphicsState();
    } catch {
      doc.addImage(dataUrl, "JPEG", x, y, w, h);
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

      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // ✅ USE IMPORTED LOGO
      const { dataUrl: logoJpeg, ok: hasLogo } =
        await loadImageAsJpeg(logo);

      // WATERMARK
      if (hasLogo) {
        const wmW = 140;
        const wmH = 78;
        const wmX = (pageWidth - wmW) / 2;
        const wmY = (pageHeight - wmH) / 2;
        safeWatermark(doc, logoJpeg, wmX, wmY, wmW, wmH);
      }

      // HEADER LOGO
      if (hasLogo) {
        doc.addImage(logoJpeg, "JPEG", 9, 12, 56, 31);
      }

      doc.text("Shree Aandavar Tooling", 69, 22);

      doc.save("Delivery_Challan.pdf");

    } catch (error) {
      alert("PDF Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      {/* ✅ HEADER WITH LOCAL LOGO */}
      <div className="sales-header">
        <div className="header-left">
          <img src={logo} alt="logo" className="header-logo" />
        </div>

        <div className="header-content">
          <h1>Delivery Challan</h1>
          <p>Add multiple products for a single customer</p>
        </div>
      </div>

      {/* FORM */}
      <div className="sales-form">
        <div className="sales-row">
          <div className="sales-group">
            <label>Customer Name</label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customerOptions.map((c, i) => (
                <option key={i} value={c.customer_name}>
                  {c.customer_name}
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
                <option key={i} value={p.product_name}>
                  {p.product_name}
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

        <button className="sales-pdf-btn" onClick={generatePDF}>
          Generate PDF
        </button>
      </div>
    </div>
  );
}

export default DeliveryChallan;