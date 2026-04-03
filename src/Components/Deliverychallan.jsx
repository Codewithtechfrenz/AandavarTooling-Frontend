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

  // ✅ UPDATED PDF FUNCTION — matches letterhead design
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
      const pageWidth = doc.internal.pageSize.getWidth();   // 210
      const pageHeight = doc.internal.pageSize.getHeight(); // 297

      // ===== LOAD LOGO =====
      let logoLoaded = false;
      const logo = new Image();
      logo.src = "/Assets/SAT Logo.jpeg";

      await new Promise((resolve) => {
        logo.onload = () => {
          logoLoaded = true;
          resolve();
        };
        logo.onerror = resolve;
      });

      // ===== WATERMARK — SAT logo centred on page =====
      if (logoLoaded) {
        doc.setGState(new doc.GState({ opacity: 0.06 }));
        const wmSize = 110;
        doc.addImage(
          logo,
          "JPEG",
          (pageWidth - wmSize) / 2,
          (pageHeight - wmSize) / 2,
          wmSize,
          wmSize
        );
        doc.setGState(new doc.GState({ opacity: 1 }));
      }

      // ===== OUTER PAGE BORDER =====
      doc.setLineWidth(0.6);
      doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

      // ===== HEADER SECTION (matches letterhead image) =====
      // Outer header box
      doc.setLineWidth(0.4);
      doc.rect(7, 7, pageWidth - 14, 48);

      // ── Top-right: "DELIVERY CHALLAN" box ──
      doc.setLineWidth(0.4);
      doc.rect(143, 7, 60, 13);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("DELIVERY CHALLAN", 173, 15.5, { align: "center" });

      // ── Top-right: Cell number (next to box) ──
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Cell : 9944130610", 173, 25, { align: "center" });

      // ── Left: SAT Logo in header ──
      if (logoLoaded) {
        doc.addImage(logo, "JPEG", 10, 10, 28, 28);
      }

      // ── Company Name — large, styled ──
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Shree Aandavar Tooling", 43, 23);

      // ── Tagline ──
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("CNC Machine Service and Tooling & Job Work", 43, 30);

      // ── Address ──
      doc.setFontSize(9);
      doc.text(
        "Shop No. 1/68, Ambalakaranpatti, Ulakaneri, MADURAI - 625 107.",
        43,
        36
      );

      // ── Email & Date ──
      doc.text("mailto : prabusangari690@gmail.com", 43, 42);
      doc.setFont("helvetica", "bold");
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 143, 42);

      // ===== SUB-HEADER: Challan No + Customer =====
      const subY = 60;
      doc.setLineWidth(0.3);
      doc.line(7, subY - 3, pageWidth - 7, subY - 3); // top line
      doc.line(7, subY + 9, pageWidth - 7, subY + 9); // bottom line

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Challan No :", 12, subY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "DC-" + String(productsList.length).padStart(3, "0"),
        42,
        subY + 5
      );

      doc.setFont("helvetica", "bold");
      doc.text("To :", 100, subY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(customerName, 112, subY + 5);

      // ===== PRODUCT TABLE =====
      const tableColumn = ["S.No", "Product Name", "Quantity", "Date"];
      const tableRows = productsList.map((item, index) => [
        index + 1,
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
        columnStyles: {
          1: { halign: "left" }, // Product name left-aligned
        },
        margin: { left: 9, right: 9 },
        tableLineColor: [180, 180, 180],
        tableLineWidth: 0.3,
      });

      // ===== FOOTER — always at bottom of page =====
      const footerY = pageHeight - 38;

      // Footer top divider
      doc.setLineWidth(0.4);
      doc.line(7, footerY, pageWidth - 7, footerY);

      // Footer bottom divider (page border bottom)
      doc.line(7, pageHeight - 7, pageWidth - 7, pageHeight - 7);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // Left side
      doc.text("Received the goods in good condition", 12, footerY + 8);

      // Right side
      doc.text("For Shree Aandavar Tooling", pageWidth - 12, footerY + 8, {
        align: "right",
      });

      // Signature lines
      const sigY = footerY + 26;
      doc.setLineWidth(0.3);

      // Left signature line
      doc.line(12, sigY, 75, sigY);
      doc.setFontSize(9);
      doc.text("Party's Signature", 12, sigY + 5);

      // Right signature line
      doc.line(pageWidth - 75, sigY, pageWidth - 12, sigY);
      doc.text("Signatory", pageWidth - 12, sigY + 5, { align: "right" });

      doc.save("Delivery_Challan.pdf");
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  // ===== JSX — original web page design unchanged =====
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

export default DeliveryChallan;g