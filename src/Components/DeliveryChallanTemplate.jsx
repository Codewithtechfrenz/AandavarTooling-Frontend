import React from "react";
import logo from "../Assets/AandavarLogo1.png";
import "../CSS/InvoiceTemplate.css";

function DeliveryChallanTemplate({ challanData }) {
  return (
    <div className="invoice-container">
      {/* Header */}
      <div className="company-header">
        <img src={logo} alt="Logo" className="company-logo" />
        <div className="company-info">
          <h2>SHREE AANDAVAR TOOLING</h2>
          <p>CNC Machine Service and Tooling & Job Work</p>
          <p>Madurai, Tamil Nadu - 625107</p>
          <p>📞 99441 30610 | ✉ prabusangari690@gmail.com</p>
        </div>
      </div>

      {/* Customer */}
      <div className="bill-details">
        <div>
          <h4>To:</h4>
          <p>{challanData?.recipientName}</p>
          <p>{challanData?.recipientAddress}</p>
        </div>
        <div>
          <p>Order No: {challanData?.orderNo}</p>
          <p>Date: {challanData?.date}</p>
        </div>
      </div>

      {/* Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Particulars</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {challanData?.items?.length > 0 ? (
            challanData.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No Items</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div className="payment-wrapper">
        <div>
          <p>Received the goods in good condition</p>
          <p>Party Signature: __________</p>
        </div>
        <div>
          <p>For SHREE AANDAVAR TOOLING</p>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}

export default DeliveryChallanTemplate;