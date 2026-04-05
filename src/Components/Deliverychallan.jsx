// 

import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/Deliverychallan.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";

function DeliveryChallan() {
  const [deliveryChallanNo, setDeliveryChallanNo] = useState(""); // ✅ NEW
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
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");
      if (res.data?.data) setProductOptions(res.data.data);
    } catch (error) {
      console.error("Product API Error:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/custdrop/getdropCustomers");
      if (res.data?.data) setCustomerOptions(res.data.data);
    } catch (error) {
      console.error("Customer API Error:", error);
    }
  };

  // ✅ Add Product
  const addProduct = () => {
    if (!deliveryChallanNo || !customerName || !productName || !quantity) {
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

  // ✅ Save to DB
  const saveDeliveryChallan = async () => {
    try {
      for (const item of productsList) {
        await api.post("/delivery/createDeliveryChallan", {
          customer_name: item.customerName,
          product_name: item.productName,
          quantity: item.quantity,
          created_date: new Date().toISOString().split("T")[0],
          DeliveryChallanNo: deliveryChallanNo, // ✅ IMPORTANT
        });
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  // ✅ Image Loader
  const loadImageAsJpeg = (url) =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        resolve({ dataUrl: canvas.toDataURL("image/jpeg"), ok: true });
      };

      img.onerror = () => resolve({ dataUrl: null, ok: false });

      img.src = url;
    });

  // ✅ PDF Generator
  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    try {
      setLoading(true);

      await saveDeliveryChallan();

      const doc = new jsPDF("p", "mm", "a4");

      const { dataUrl, ok } = await loadImageAsJpeg("/AndavarLogo2.png");

      // Watermark
      if (ok) {
        doc.addImage(dataUrl, "JPEG", 35, 100, 140, 70);
      }

      // Border
      doc.rect(7, 7, 196, 283);

      // Header
      doc.rect(7, 7, 196, 50);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("DELIVERY CHALLAN", 150, 15);

      doc.setFontSize(10);
      doc.text("Cell : 9944130610", 150, 22);

      if (ok) {
        doc.addImage(dataUrl, "JPEG", 10, 10, 50, 30);
      }

      doc.setFontSize(18);
      doc.text("SHREE AANDAVAR TOOLING", 65, 20);

      doc.setFontSize(9);
      doc.text(
        "5/520 D, Kabeer Nagar MasthanPatti Madurai - 20.",
        65,
        30
      );

      doc.text("mailto : prabusangari690@gmail.com", 65, 36);

      doc.text(`Date : ${new Date().toLocaleDateString()}`, 150, 45);

      // Sub Header
      doc.text("Challan No :", 10, 65);
      doc.text(deliveryChallanNo, 40, 65); // ✅ USER INPUT

      doc.text("To :", 100, 65);
      doc.text(customerName, 110, 65);

      // Table
      autoTable(doc, {
        startY: 70,
        head: [["S.No", "Product Name", "Quantity", "Date"]],
        body: productsList.map((item, index) => [
          index + 1,
          item.productName,
          item.quantity,
          item.created,
        ]),
      });

      // Footer
      doc.text(
        "Received the goods in good condition",
        10,
        270
      );

      doc.text("For Shree Aandavar Tooling", 140, 270);

      doc.line(10, 280, 70, 280);
      doc.line(140, 280, 200, 280);

      doc.text("Party Signature", 10, 285);
      doc.text("Authorized Signatory", 140, 285);

      doc.save("Delivery_Challan.pdf");

      // ✅ Reset form
      setProductsList([]);
      setCustomerName("");
      setDeliveryChallanNo("");

    } catch (error) {
      console.error(error);
      alert("PDF Error");
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
      </div>

      <div className="sales-form">

        {/* ✅ Challan Input */}
        <div className="sales-row">
          <div className="sales-group">
            <label>Delivery Challan No</label>
            <input
              type="text"
              value={deliveryChallanNo}
              onChange={(e) => setDeliveryChallanNo(e.target.value)}
              placeholder="Enter Challan No"
              disabled={productsList.length > 0}
            />
          </div>
        </div>

        {/* Customer */}
        <div className="sales-row">
          <div className="sales-group">
            <label>Customer Name</label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={productsList.length > 0}
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

        {/* Product */}
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

        <button onClick={addProduct}>Add Product</button>

        <button onClick={generatePDF} disabled={loading}>
          {loading ? "Generating..." : "Generate PDF"}
        </button>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {productsList.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.customerName}</td>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{item.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DeliveryChallan;