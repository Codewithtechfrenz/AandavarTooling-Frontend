// import React from "react";
// import logo from "../Assets/AandavarLogo1.png";
// import "../CSS/InvoiceTemplate.css";

// function DeliveryChallanTemplate({ challanData }) {
//   return (
//     <div className="invoice-container">
//       {/* Header */}
//       <div className="company-header">
//         <img src={logo} alt="Logo" className="company-logo" />
//         <div className="company-info">
//           <h2>SHREE AANDAVAR TOOLING</h2>
//           <div>📍 5/520 D, Kabeer Nagar MasthanPatti Madurai - 20</div>
//           <div>✉ prabusangari690@gmail.com</div>
//           <div>📞 9944130610</div>
//         </div>
//       </div>

//       {/* Customer */}
//       <div className="bill-details">
//         <div>
//           <h4>To:</h4>
//           <p>{challanData?.recipientName}</p>
//           <p>{challanData?.recipientAddress}</p>
//         </div>
//         <div>
//           <p>Order No: {challanData?.orderNo}</p>
//           <p>Date: {challanData?.date}</p>
//         </div>
//       </div>

//       {/* Table */}
//       <table className="invoice-table">
//         <thead>
//           <tr>
//             <th>Sl No</th>
//             <th>Particulars</th>
//             <th>Quantity</th>
//           </tr>
//         </thead>
//         <tbody>
//           {challanData?.items?.length > 0 ? (
//             challanData.items.map((item, index) => (
//               <tr key={index}>
//                 <td>{index + 1}</td>
//                 <td>{item.name}</td>
//                 <td>{item.quantity}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="3">No Items</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Footer */}
//       <div className="payment-wrapper">
//         <div>
//           <p>Received the goods in good condition</p>
//           <p>Party Signature: __________</p>
//         </div>
//         <div>
//           <p>For SHREE AANDAVAR TOOLING</p>
//           <p>Authorized Signatory</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DeliveryChallanTemplate;




import React from "react";
import logo from "../Assets/AandavarLogo1.png";
import "../CSS/deliveryTemplate.css";

function DeliveryChallanTemplate({ challanData }) {
  return (
    <div className="invoice-container">
      
      {/* 🔥 WATERMARK */}
      <img
        src="/andavarwt.jpeg"
        alt="Watermark"
        className="invoice-watermark"
      />

      {/* Header */}
      <div className="company-header">
        <img src={logo} alt="Logo" className="company-logo" />
        <div className="company-info">
         <h2>SHREE AANDAVAR TOOLING</h2>
         <p>Delivery Challan</p>
          <p>📍 5/520 D, Kabeer Nagar MasthanPatti Madurai - 20</p>
          <p>✉ prabusangari690@gmail.com</p>
            <p>📞 9944130610</p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bill-details">
        <div>
          <h4>To:</h4>
          <p>{challanData?.recipientName || "Customer Name"}</p>
          <p>{challanData?.recipientAddress || "Customer Address"}</p>
        </div>
        <div>
          <p>Delivery challan No: {challanData?.orderNo || "NA"}</p>
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

export default DeliveryChallanTemplate;