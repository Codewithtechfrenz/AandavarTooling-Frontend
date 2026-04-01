import React, { useEffect, useState } from "react";
import "../CSS/InvoiceTemplate.css";
import axios from "axios";
import { useParams } from "react-router-dom";

function InvoiceTemplate() {
  const { invoiceNo } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(
        `https://admin.shreeaandavartooling.in/backend/sales/invoice/${invoiceNo}`
      );

      if (res.data.status === 1) {
        setInvoice(res.data.invoice);
        setItems(res.data.items);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!invoice) return <div>Loading Invoice...</div>;

  return (
    <div id="invoice" className="invoice-container">

      <img
        src="/AandavarLogo2.png"
        alt="Watermark Logo"
        className="invoice-watermark"
      />

      {/* TOP BAR */}
      <div className="top-bar">
        <div>📞 9944130610</div>
        <div>✉ prabusangari690@gmail.com</div>
        <div>📍 5/520 D, kabeer Nagar MasthanPatti Madurai - 20</div>
      </div>

      {/* COMPANY HEADER */}
      <div className="company-header">
        <div className="company-left">
          <div className="logo-text-wrapper">
            <img src="/AandavarLogo1.png" alt="Logo" className="company-logo" />
            <div className="company-info">
              <h2>SHREE AANDAVAR TOOLING</h2>
              <p>GSTIN: 33BYPPP7144R1Z0</p>
              <p>State: 33-Tamil Nadu</p>
            </div>
          </div>
        </div>

        <div className="invoice-title">
          <h1>Tax Invoice</h1>
        </div>
      </div>

      {/* BILL DETAILS */}
      <div className="bill-details">
        <div className="bill-left">
          <h4>Bill To</h4>
          <p><b>Company Name: {invoice.Customer_Name}</b></p>
          <p>Address: {invoice.Customer_Address}</p>
          <p>Contact No: {invoice.Customer_Phone}</p>
          <p>GSTIN Number: {invoice.Customer_GSTIN}</p>
          <p>State: Tamil Nadu</p>
        </div>

        <div className="bill-right">
          <p>Invoice No: {invoice.Invoice_No}</p>
          <p>Date: {invoice.Invoice_Date}</p>
          <p>Place of Supply: Tamil Nadu</p>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>HSN/SAC</th>
            <th>Quantity</th>
            <th>Price/unit</th>
            <th>GST</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.Product_Name}</td>
              <td>-</td>
              <td>{item.Quantity}</td>
              <td>{item.Price}</td>
              <td>{item.SGST + item.CGST}%</td>
              <td>{item.Total_Amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="payment-wrapper">
        <div className="payto">
          <h4>Pay To:</h4>
          <p>Bank Name: BANK OF BARODA</p>
          <p>Bank Account No: 75220200001446</p>
          <p>Bank IFSC Code: BARBOVJMAAN</p>
          <p>Account Holder's Name: SHREE AANDAVAR TOOLING</p>
        </div>

        <div className="total-box">
          <table>
            <tbody>
              <tr>
                <td>Sub Total</td>
                <td>{invoice.Subtotal}</td>
              </tr>
              <tr>
                <td>GST Total</td>
                <td>{invoice.GST_Total}</td>
              </tr>
              <tr className="total-row">
                <td>Total</td>
                <td>{invoice.Total_Amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default InvoiceTemplate;