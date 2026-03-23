import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../CSS/Reports.css";

function Reports() {

const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const [itemName, setItemName] = useState("");

const handleSearch = () => {

if (!dateFrom && !dateTo && !itemName) {
alert("Please enter search criteria");
return;
}

console.log({
dateFrom,
dateTo,
itemName
});

alert("Report Generated");

};

return (

<div className="report-page">

<Sidebar />
<Topbar />

{/* HEADER */}

<div className="report-header">

<div>
<h1>Reports</h1>
<p>Generate and export reports</p>
</div>

</div>


{/* FORM */}

<div className="report-form">

<div className="report-row">

<div className="report-group">
<label>Date From</label>
<input
type="date"
value={dateFrom}
onChange={(e) => setDateFrom(e.target.value)}
/>
</div>

<div className="report-group">
<label>Date To</label>
<input
type="date"
value={dateTo}
onChange={(e) => setDateTo(e.target.value)}
/>
</div>

<div className="report-group">
<label>Item Name</label>
<input
type="text"
placeholder="Enter item name"
value={itemName}
onChange={(e) => setItemName(e.target.value)}
/>
</div>

</div>

<button className="report-btn" onClick={handleSearch}>
Search
</button>

</div>

</div>

);

}

export default Reports;