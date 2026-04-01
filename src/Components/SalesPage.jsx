import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import InvoicePDF from "../Components/InvoicePDF";
import "../CSS/SalesPage.css";
 
function SalesPage() {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [customer, setCustomer] = useState({});
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
 
  const [itemList, setItemList] = useState([]);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
 
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
 
  const sgst = 9;
  const cgst = 9;
 
  const [loading, setLoading] = useState(false);
 
  /* ================= AUTO LOAD ================= */
  useEffect(() => {
    generateInvoice();
    fetchProducts();
    fetchCustomers();
  }, []);
 
  /* ================= GENERATE INVOICE ================= */
  const generateInvoice = () => {
    setInvoiceNo("INV-" + Date.now());
    setInvoiceDate(new Date().toISOString().split("T")[0]);
  };
 
  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8001/items/getItems");
      const data = await res.json();
      setProductOptions(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
 
  /* ================= FETCH CUSTOMERS ================= */
  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:8001/customers/getCustomers");
      const data = await res.json();
      setCustomerOptions(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
 
  /* ================= GET CUSTOMER DETAILS ================= */
  const handleCustomerChange = async (id) => {
    try {
      const res = await fetch("http://localhost:8001/customers/getCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ S_No: id }),
      });
      const data = await res.json();
      if (data.status === 1) setCustomer(data.data);
    } catch (err) {
      console.error(err);
    }
  };
 
  /* ================= ADD/UPDATE ITEM IN GRID ================= */
  const addItem = () => {
    if (!productName || !quantity || !price) {
      alert("Please fill product, quantity, and price");
      return;
    }
 
    const newItem = {
      productName,
      quantity: Number(quantity),
      price: Number(price),
      subTotal: Number(quantity) * Number(price),
      gstAmount: Number(quantity) * Number(price) * ((sgst + cgst) / 100),
      total: Number(quantity) * Number(price) * (1 + (sgst + cgst) / 100),
    };
 
    if (editingItemIndex !== null) {
      const updatedItems = [...itemList];
      updatedItems[editingItemIndex] = newItem;
      setItemList(updatedItems);
      setEditingItemIndex(null);
    } else {
      setItemList([...itemList, newItem]);
    }
 
    setProductName("");
    setQuantity("");
    setPrice("");
  };
 
  const editItem = (index) => {
    const item = itemList[index];
    setProductName(item.productName);
    setQuantity(item.quantity);
    setPrice(item.price);
    setEditingItemIndex(index);
  };
 
  const deleteItem = (index) => {
    const updatedItems = itemList.filter((_, i) => i !== index);
    setItemList(updatedItems);
  };
 
  /* ================= TOTALS ================= */
  const subTotal = itemList.reduce((acc, item) => acc + item.subTotal, 0);
  const gstAmount = itemList.reduce((acc, item) => acc + item.gstAmount, 0);
  const totalAmount = itemList.reduce((acc, item) => acc + item.total, 0);
 
  /* ================= CLEAR FORM ================= */
  const clearForm = () => {
    setCustomer({});
    setProductName("");
    setQuantity("");
    setPrice("");
    setEditingItemIndex(null);
    setItemList([]);
    generateInvoice();
  };
 
  /* ================= SAVE INVOICE TO BACKEND ================= */
  const saveInvoice = async () => {
    if (!customer?.Cus_Name || itemList.length === 0) {
      alert("Select customer and add at least one item");
      return;
    }
 
    setLoading(true);
 
    try {
      for (const item of itemList) {
        const payload = {
          Invoice_No: invoiceNo,
          Invoice_Date: invoiceDate,
          Customer_Name: customer.Cus_Name,
          Product_Name: item.productName,
          Quantity: item.quantity,
          Price: item.price,
          SGST: sgst,
          CGST: cgst,
          Sub_Total: item.subTotal,
          GST_Total: item.gstAmount,
          Total_Amount: item.total,
        };
 
        await fetch("http://localhost:8001/sales/addsales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
 
      alert("Invoice saved successfully!");
      clearForm();
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };
 
  /* ================= PDF DATA ================= */
  const saleData = {
    invoiceNo,
    invoiceDate,
    customerName: customer?.Cus_Name,
    address: customer?.Cus_Address,
    phone: customer?.Cus_Phno,
    gst: customer?.Cus_GSTIN,
    items: itemList,
    subtotal: subTotal,
    gstAmount,
    total: totalAmount,
  };
 
  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />
 
      <div className="sales-header">
        <h1>Sales Page</h1>
      </div>
 
      <div className="sales-form">
        {/* Invoice Header */}
        <div className="sales-row">
          <div className="sales-group">
            <label>Invoice No</label>
            <input value={invoiceNo} readOnly />
          </div>
          <div className="sales-group">
            <label>Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>
 
        {/* Customer & Product */}
        <div className="sales-row">
          <div className="sales-group">
            <label>Customer</label>
            <select
              value={customer?.S_No || ""}
              onChange={(e) => handleCustomerChange(e.target.value)}
            >
              <option value="">Select</option>
              {customerOptions.map((c) => (
                <option key={c.S_No} value={c.S_No}>
                  {c.Cus_Name}
                </option>
              ))}
            </select>
          </div>
 
          <div className="sales-group">
            <label>Product</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            >
              <option value="">Select</option>
              {productOptions.map((p) => (
                <option key={p.SI} value={p.ItemName}>
                  {p.ItemName}
                </option>
              ))}
            </select>
          </div>
        </div>
 
        {/* Quantity & Price */}
        <div className="sales-row">
          <div className="sales-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
 
          <div className="sales-group">
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
 
        {/* Add/Update Item Button */}
        <button className="sales-add-btn" onClick={addItem} disabled={loading}>
          {editingItemIndex !== null ? "Update Item" : "Add Item"}
        </button>
 
        {/* ================= ITEM GRID ================= */}
        <div className="sales-table-container">
          <h2>Invoice Items</h2>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {itemList.length === 0 ? (
                <tr>
                  <td colSpan="7">No items added</td>
                </tr>
              ) : (
                itemList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>{item.subTotal}</td>
                    <td>{item.gstAmount}</td>
                    <td>{item.total}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => editItem(index)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteItem(index)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
 
          {/* Totals */}
          <div className="sales-totals">
            <p>Subtotal: {subTotal}</p>
            <p>GST: {gstAmount}</p>
            <p>Total: {totalAmount}</p>
          </div>
 
          {/* PDF & Save */}
          <div className="sales-pdf-btn">
            <InvoicePDF sale={saleData} />
          </div>
 
          <button className="sales-save-btn" onClick={saveInvoice} disabled={loading}>
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
export default SalesPage;
 