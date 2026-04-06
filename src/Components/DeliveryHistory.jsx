import React, { useEffect, useState } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import DeliveryChallanTemplate from "./DeliveryChallanTemplate"; // ✅ IMPORT

import "../CSS/Deliverychallan.css";

function DeliveryHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/delivery/getDeliveryChallanHistory");
      if (res.data.status) setHistoryList(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ UPDATED VIEW FUNCTION
  const viewChallan = async (challanNo) => {
    try {
      const res = await api.get(`/delivery/getChallanByNumber/${challanNo}`);

      if (res.data.status) {
        const data = res.data.data;

        // 🔥 FORMAT DATA FOR TEMPLATE
        const formattedData = {
          recipientName: data[0]?.customer_name,
          recipientAddress: data[0]?.address || "",
          orderNo: challanNo,
          date: data[0]?.created_date,
          items: data.map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
          })),
        };

        setSelectedChallan(formattedData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ SEARCH FILTER
  const filteredHistory = historyList.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      item.DeliveryChallanNo?.toLowerCase().includes(search) ||
      item.customer_name?.toLowerCase().includes(search) ||
      item.created_date?.toLowerCase().includes(search) ||
      item.total_items?.toString().includes(search) ||
      item.total_quantity?.toString().includes(search)
    );
  });

  return (
    <div className="sales-page">
      <Sidebar />
      <Topbar />

      <div className="sales-header">
        <h1>Delivery Challan History</h1>
      </div>

      <div className="sales-table-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>History</h2>

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "300px"
            }}
          />
        </div>

        <table className="sales-table">
          <thead>
            <tr>
              <th>Challan No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Items</th>
              <th>Total Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="6">No Challans Found</td>
              </tr>
            ) : (
              filteredHistory.map((item, index) => (
                <tr key={index}>
                  <td>{item.DeliveryChallanNo}</td>
                  <td>{item.customer_name}</td>
                  <td>{item.created_date}</td>
                  <td>{item.total_items}</td>
                  <td>{item.total_quantity}</td>
                  <td>
                    <button onClick={() => viewChallan(item.DeliveryChallanNo)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ TEMPLATE VIEW (SAME UI PAGE BELOW TABLE) */}
      {selectedChallan && (
        <div className="sales-table-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <h2>Challan Preview</h2>

            {/* ✅ CLOSE BUTTON */}
            <button onClick={() => setSelectedChallan(null)}>
              Close
            </button>
          </div>

          <DeliveryChallanTemplate challanData={selectedChallan} />
        </div>
      )}
    </div>
  );
}

export default DeliveryHistory;


// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";

// import "../CSS/Deliverychallan.css"; // ✅ NEW: Import CSS for styling

// function DeliveryHistory() {
//   const [historyList, setHistoryList] = useState([]);
//   const [selectedChallan, setSelectedChallan] = useState(null);
//   const [challanProducts, setChallanProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState(""); // ✅ NEW

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       const res = await api.get("/delivery/getDeliveryChallanHistory");
//       if (res.data.status) setHistoryList(res.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const viewChallan = async (challanNo) => {
//     try {
//       const res = await api.get(`/delivery/getChallanByNumber/${challanNo}`);
//       if (res.data.status) {
//         setSelectedChallan(challanNo);
//         setChallanProducts(res.data.data);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // ✅ FILTER LOGIC (global search across all fields)
//   const filteredHistory = historyList.filter((item) => {
//     const search = searchTerm.toLowerCase();

//     return (
//       item.DeliveryChallanNo?.toLowerCase().includes(search) ||
//       item.customer_name?.toLowerCase().includes(search) ||
//       item.created_date?.toLowerCase().includes(search) ||
//       item.total_items?.toString().includes(search) ||
//       item.total_quantity?.toString().includes(search)
//     );
//   });

//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Delivery Challan History</h1>
//       </div>

//       <div className="sales-table-card">
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <h2>History</h2>

//           {/* ✅ SEARCH INPUT (Top Right) */}
//           <input
//             type="text"
//             placeholder="Search..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               padding: "10px",
//               borderRadius: "5px",
//               border: "1px solid #ccc",
//               width: "300px"
//             }}
//           />
//         </div>

//         <table className="sales-table">
//           <thead>
//             <tr>
//               <th>Challan No</th>
//               <th>Customer</th>
//               <th>Date</th>
//               <th>Total Items</th>
//               <th>Total Quantity</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredHistory.length === 0 ? (
//               <tr>
//                 <td colSpan="6">No Challans Found</td>
//               </tr>
//             ) : (
//               filteredHistory.map((item, index) => (
//                 <tr key={index}>
//                   <td>{item.DeliveryChallanNo}</td>
//                   <td>{item.customer_name}</td>
//                   <td>{item.created_date}</td>
//                   <td>{item.total_items}</td>
//                   <td>{item.total_quantity}</td>
//                   <td>
//                     <button onClick={() => viewChallan(item.DeliveryChallanNo)}>
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedChallan && (
//         <div className="sales-table-card">
//           <h2>Challan Details: {selectedChallan}</h2>
//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Customer</th>
//                 <th>Product</th>
//                 <th>Quantity</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {challanProducts.length === 0 ? (
//                 <tr>
//                   <td colSpan="4">No Products Found</td>
//                 </tr>
//               ) : (
//                 challanProducts.map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.customer_name}</td>
//                     <td>{item.product_name}</td>
//                     <td>{item.quantity}</td>
//                     <td>{item.created_date}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DeliveryHistory;










// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";

// function DeliveryHistory() {
//   const [historyList, setHistoryList] = useState([]);
//   const [selectedChallan, setSelectedChallan] = useState(null);
//   const [challanProducts, setChallanProducts] = useState([]);

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       const res = await api.get("/delivery/getDeliveryChallanHistory");
//       if (res.data.status) setHistoryList(res.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const viewChallan = async (challanNo) => {
//     try {
//       const res = await api.get(`/delivery/getChallanByNumber/${challanNo}`);
//       if (res.data.status) {
//         setSelectedChallan(challanNo);
//         setChallanProducts(res.data.data);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="sales-page">
//       <Sidebar />
//       <Topbar />

//       <div className="sales-header">
//         <h1>Delivery Challan History</h1>
//       </div>

//       <div className="sales-table-card">
//         <h2>History</h2>
//         <table className="sales-table">
//           <thead>
//             <tr>
//               <th>Challan No</th>
//               <th>Customer</th>
//               <th>Date</th>
//               <th>Total Items</th>
//               <th>Total Quantity</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {historyList.length === 0 ? (
//               <tr>
//                 <td colSpan="6">No Challans Found</td>
//               </tr>
//             ) : (
//               historyList.map((item, index) => (
//                 <tr key={index}>
//                   <td>{item.DeliveryChallanNo}</td>
//                   <td>{item.customer_name}</td>
//                   <td>{item.created_date}</td>
//                   <td>{item.total_items}</td>
//                   <td>{item.total_quantity}</td>
//                   <td>
//                     <button onClick={() => viewChallan(item.DeliveryChallanNo)}>
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedChallan && (
//         <div className="sales-table-card">
//           <h2>Challan Details: {selectedChallan}</h2>
//           <table className="sales-table">
//             <thead>
//               <tr>
//                 <th>Customer</th>
//                 <th>Product</th>
//                 <th>Quantity</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {challanProducts.length === 0 ? (
//                 <tr>
//                   <td colSpan="4">No Products Found</td>
//                 </tr>
//               ) : (
//                 challanProducts.map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.customer_name}</td>
//                     <td>{item.product_name}</td>
//                     <td>{item.quantity}</td>
//                     <td>{item.created_date}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DeliveryHistory;