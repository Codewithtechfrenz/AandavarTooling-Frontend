import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ changed
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/Returndeliverychallan.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Returndeliverychallan() {
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productsList, setProductsList] = useState([]);

  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await api.get("/activeitems/activeitem"); // ✅ changed
      if (response.data && response.data.data) {
        setProductOptions(response.data.data);
      }
    } catch (error) {
      console.error("Product API Error:", error);
    }
  };

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      const response = await api.get("/custdrop/getdropCustomers"); // ✅ changed
      if (response.data && response.data.data) {
        setCustomerOptions(response.data.data);
      }
    } catch (error) {
      console.error("Customer API Error:", error);
    }
  };

  // Add Product to Grid
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

  // Save to Backend DB
  const saveReturnDelivery = async () => {
    try {
      for (const item of productsList) {
        await api.post("/returndelivery/createReturnDeliveryChallan", { // ✅ changed
          customer_name: item.customerName,
          challan_date: new Date().toISOString().split("T")[0],
        });
      }
      return true;
    } catch (error) {
      console.error("Save Error:", error);
      return false;
    }
  };

  // Generate PDF + Save DB + Clear Grid
  const generatePDF = async () => {
    if (productsList.length === 0) {
      alert("Add products first");
      return;
    }

    const saved = await saveReturnDelivery();

    if (!saved) {
      alert("Failed to save data");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Aandavar Tooling", 14, 15);

    doc.setFontSize(11);
    doc.text("Company Address: Madurai, Tamil Nadu, India", 14, 22);

    doc.setFontSize(14);
    doc.text("Return Delivery Challan", 14, 35);

    doc.setFontSize(11);
    doc.text(`Customer: ${customerName}`, 14, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 42);

    const tableColumn = ["ID", "Customer", "Product", "Quantity", "Created"];

    const tableRows = productsList.map((item) => [
      item.id,
      item.customerName,
      item.productName,
      item.quantity,
      item.created,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Return_Delivery_Challan.pdf");

    // Clear Grid
    setProductsList([]);
    setCustomerName("");
    setProductName("");
    setQuantity("");
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <div className="sales-header">
        <h1>Return Delivery Challan</h1>
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

export default Returndeliverychallan;