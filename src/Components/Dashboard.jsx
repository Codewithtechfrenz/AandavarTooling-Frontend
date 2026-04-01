// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import Topbar from "./Topbar";
// import Page from "./Page";

// function Dashboard() {
//   return (
//     <div style={{ display: "flex" }}>
//       <Sidebar />

//       <div className="main-area">
//         <Topbar />

//         <div className="page-content">
//           <Routes>
//             <Route path="/" element={<Page />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;



import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Page from "./Page";
import InvoiceTemplate from "./InvoiceTemplate"; // add this

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Page />} />

            {/* ADD THIS */}
            <Route path="invoice/:invoiceNo" element={<InvoiceTemplate />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;