import React from "react";
import logo from "../Assets/AandavarLogo1.png";
import "../CSS/deliveryTemplate.css";

function ReturnDeliveryChallanTemplate({ challanData }) {
  return (
    <div className="invoice-container">
      
      {/* 🔥 WATERMARK */}
      <img
        src="/andavarwt.png"
        alt="Watermark"
        className="invoice-watermark"
      />
      <div className="header-wrapper">
  
  <div className="company-header-wrapper">
  <div className="company-logo-container">
    <img src={logo} alt="Logo" className="company-logo" />
  </div>

  <div className="company-info-container">
    <h2>SHREE AANDAVAR TOOLING</h2>
    <h4>Return Delivery Challan</h4>
    <p>📍 5/520 D, Kabeer Nagar MasthanPatti Madurai - 20</p>
    <p>✉ prabusangari690@gmail.com</p>
    <p>📞 9944130610</p>
  </div>
</div>



</div>

      {/* Customer Details */}
      <div className="bill-details">
        <div>
          <h4>To:</h4>
          <p>{challanData?.recipientName || "Customer Name"}</p>
          <p>{challanData?.recipientAddress || "Customer Address"}</p>
          <p>__________________________________</p>
          <p>__________________________________</p>
          <p>__________________________________</p>
        </div>
        <div>
          <p>Return Delivery challan No: {challanData?.orderNo || "NA"}</p>
          <p>Date: {challanData?.date || new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Sl. No</th>
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
              <td colSpan="3" style={{ textAlign: "center" }}>
                No Items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div className="payment-wrapper">
        <div>
          <p>Received the goods in good condition</p>
          <p>Party's Signature: ______________________</p>
        </div>
        <div>
          <p>For SHREE AANDAVAR TOOLING</p>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}

export default ReturnDeliveryChallanTemplate;