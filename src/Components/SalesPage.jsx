import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import InvoicePDF from "../Components/InvoicePDF";
import "../CSS/SalesPage.css";

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");

  const [customer, setCustomer] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [sgst] = useState(9);
  const [cgst] = useState(9);

  const [editingId, setEditingId] = useState(null);

  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  /* ================= CALCULATIONS ================= */

  const subTotal = quantity && price ? quantity * price : 0;
  const gstAmount = subTotal * ((sgst + cgst) / 100);
  const totalAmount = subTotal + gstAmount;

  /* ================= AUTO INVOICE ================= */

  useEffect(() => {
    generateInvoice();
  }, []);

  const generateInvoice = () => {
    const inv = "INV-" + Date.now();
    setInvoiceNo(inv);

    const today = new Date().toISOString().split("T")[0];
    setInvoiceDate(today);
  };

  /* ================= FETCH SALES ================= */

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales/getSales");

      if (res.data?.status === 1) {
        setSales(res.data.data);
      } else {
        setSales([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get("/items/getItems");
      setProductOptions(res.data?.data || []);
    };
    fetchProducts();
  }, []);

  /* ================= FETCH CUSTOMERS ================= */

  useEffect(() => {
    const fetchCustomers = async () => {
      const res = await api.get("/customers/getCustomers");
      setCustomerOptions(res.data?.data || []);
    };
    fetchCustomers();
  }, []);

  /* ================= SAVE SALES ================= */

  const handleSaveSales = async () => {
    const payload = {
      Sale_ID: editingId,
      Invoice_No: invoiceNo,
      Invoice_Date: invoiceDate,
      Customer_Name: customer,
      Product_Name: productName,
      Quantity: Number(quantity),
      Price: Number(price),
      SGST: sgst,
      CGST: cgst,
      Sub_Total: subTotal,
      GST_Total: gstAmount,
      Total_Amount: totalAmount
    };

    try {
      let res;

      if (editingId) {
        res = await api.post("/sales/updateSales", payload);
      } else {
        res = await api.post("/sales/addsales", payload);
      }

      if (res.data.status === 1) {
        fetchSales();
        clearForm();
        generateInvoice();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= EDIT ================= */

  const editSale = (item) => {
    setEditingId(item.Sale_ID);
    setInvoiceNo(item.Invoice_No);
    setInvoiceDate(item.Invoice_Date);
    setCustomer(item.Customer_Name);
    setProductName(item.Product_Name);
    setQuantity(item.Quantity);
    setPrice(item.Price);
  };

  /* ================= DELETE ================= */

  const deleteSale = async (id) => {
    await api.post(`/sales/deleteSales/${id}`);
    fetchSales();
  };

  const clearForm = () => {
    setCustomer("");
    setProductName("");
    setQuantity("");
    setPrice("");
    setEditingId(null);
  };

  /* ================= PDF ================= */

  const saleData = {
    invoiceNo,
    invoiceDate,
    customerName: customer,
    product: productName,
    quantity,
    price,
    subtotal: subTotal,
    gstAmount,
    total: totalAmount
  };

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <div className="sales-header">
        <h1>Sales Page</h1>
      </div>

      {/* FORM */}

      <div className="sales-form">
        <div className="sales-row">
          <div className="sales-group">
            <label>Invoice No</label>
            <input
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
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

        <div className="sales-row">
          <div className="sales-group">
            <label>Customer</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              <option value="">Select</option>
              {customerOptions.map((c) => (
                <option key={c.S_No}>{c.Cus_Name}</option>
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
                <option key={p.Item_ID}>{p.ItemName}</option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="sales-row">
          <div className="sales-group">
            <label>Sub Total</label>
            <input value={subTotal} readOnly />
          </div>

          <div className="sales-group">
            <label>GST</label>
            <input value={gstAmount} readOnly />
          </div>

          <div className="sales-group">
            <label>Total</label>
            <input value={totalAmount} readOnly />
          </div>
        </div>

        <button className="sales-add-btn" onClick={handleSaveSales}>
          {editingId ? "Update Sales" : "Add Sales"}
        </button>
      </div>

      {/* GRID */}

      <div className="sales-table-card">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>SGST</th>
              <th>CGST</th>
              <th>SubTotal</th>
              <th>GST</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((item) => (
              <tr key={item.Sale_ID}>
                <td>{item.Sale_ID}</td>
                <td>{item.Invoice_No}</td>
                <td>{item.Invoice_Date}</td>
                <td>{item.Customer_Name}</td>
                <td>{item.Product_Name}</td>
                <td>{item.Quantity}</td>
                <td>{item.Price}</td>
                <td>{item.SGST}</td>
                <td>{item.CGST}</td>
                <td>{item.Sub_Total}</td>
                <td>{item.GST_Total}</td>
                <td>{item.Total_Amount}</td>

                <td>
                  <button onClick={() => editSale(item)}>Edit</button>
                  <button onClick={() => deleteSale(item.Sale_ID)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sales-pdf-btn">
        <InvoicePDF sale={saleData} />
      </div>
    </div>
  );
}

export default SalesPage;