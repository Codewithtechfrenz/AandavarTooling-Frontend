import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Page from "./Page";

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Page />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;