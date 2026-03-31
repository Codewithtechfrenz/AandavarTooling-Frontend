import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import InvoicePDF from "../Components/InvoicePDF";
import "../CSS/SalesPage.css";

function SalesPage() {

const [sales, setSales] = useState([]);

const [customer, setCustomer] = useState("");
const [productName, setProductName] = useState("");
const [quantity, setQuantity] = useState("");
const [price, setPrice] = useState("");

const [sgst] = useState(9);
const [cgst] = useState(9);

const [selectedBank, setSelectedBank] = useState("bank1");

const [productOptions, setProductOptions] = useState([]);
const [customerOptions, setCustomerOptions] = useState([]);

/* ================= CALCULATIONS ================= */

const subTotal = quantity && price ? quantity * price : 0;
const gstAmount = subTotal * ((Number(sgst) + Number(cgst)) / 100);
const totalAmount = subTotal + gstAmount;

/* ================= FETCH SALES ================= */

useEffect(() => {
fetchSales();
}, []);

const fetchSales = async () => {
try {
const res = await api.get("/getSales");

if (res.data?.status === 1) {
setSales(res.data.data);
} else {
setSales([]);
}

} catch (err) {
console.error("Sales Fetch Error:", err);
}
};

/* ================= FETCH PRODUCTS ================= */

useEffect(() => {
const fetchProducts = async () => {
try {
const res = await api.get("/items/getItems");
setProductOptions(res.data?.data || []);
} catch (err) {
console.error("Product Error:", err);
}
};
fetchProducts();
}, []);

/* ================= FETCH CUSTOMERS ================= */

useEffect(() => {
const fetchCustomers = async () => {
try {
const res = await api.get("/customers/getCustomers");
setCustomerOptions(res.data?.data || []);
} catch (err) {
console.error("Customer Error:", err);
}
};
fetchCustomers();
}, []);

/* ================= ADD SALES ================= */

const addSales = async () => {

if (!productName || !customer) {
alert("Customer and Product required");
return;
}

const payload = {
customer_name: customer,
product_name: productName,
quantity: Number(quantity),
price: Number(price),
sgst: Number(sgst),
cgst: Number(cgst),
subtotal: subTotal,
gst_total: gstAmount,
total: totalAmount
};

try {

const res = await api.post("/addsales", payload);

if (res.data?.status === 1) {

await fetchSales();
clearForm();

} else {
alert(res.data?.message || "Failed");
}

} catch (err) {
console.error("Sales Save Error:", err);
alert("Server Error");
}

};

/* ================= DELETE SALES ================= */

const deleteSale = async (id) => {

const confirmDelete = window.confirm("Are you sure?");
if (!confirmDelete) return;

try {

const res = await api.delete(`/deleteSales/${id}`);

if (res.data?.status === 1) {
await fetchSales();
}

} catch (err) {
console.error("Delete Error:", err);
}

};

/* ================= CLEAR FORM ================= */

const clearForm = () => {
setCustomer("");
setProductName("");
setQuantity("");
setPrice("");
};

/* ================= PDF DATA ================= */

const saleData = {
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
<p>Manage Sales Transactions</p>
</div>

{/* FORM */}

<div className="sales-form">

<div className="sales-row">

<div className="sales-group">
<label>Customer</label>
<select
value={customer}
onChange={(e) => setCustomer(e.target.value)}
>
<option value="">Select Customer</option>

{customerOptions.map((cust) => (
<option key={cust.S_No} value={cust.Cus_Name}>
{cust.Cus_Name}
</option>
))}

</select>
</div>

<div className="sales-group">
<label>Product</label>
<select
value={productName}
onChange={(e) => {

const selected = productOptions.find(
(p) => p.ItemName === e.target.value
);

setProductName(e.target.value);

if (selected) {
setPrice(selected.Price || "");
}

}}
>
<option value="">Select Product</option>

{productOptions.map((item) => (
<option key={item.Item_ID} value={item.ItemName}>
{item.ItemName}
</option>
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
<label>SGST (%)</label>
<input type="number" value={sgst} readOnly />
</div>

<div className="sales-group">
<label>CGST (%)</label>
<input type="number" value={cgst} readOnly />
</div>

</div>

<div className="sales-row">

<div className="sales-group">
<label>Sub Total</label>
<input type="text" value={subTotal} readOnly />
</div>

<div className="sales-group">
<label>GST Amount</label>
<input type="text" value={gstAmount} readOnly />
</div>

<div className="sales-group">
<label>Total Amount</label>
<input type="text" value={totalAmount} readOnly />
</div>

</div>

<button className="sales-add-btn" onClick={addSales}>
Add Sales
</button>

</div>

{/* TABLE */}

<div className="sales-table-card">

<table className="sales-table">

<thead>
<tr>
<th>ID</th>
<th>Customer</th>
<th>Product</th>
<th>Qty</th>
<th>Price</th>
<th>SGST</th>
<th>CGST</th>
<th>Sub Total</th>
<th>GST</th>
<th>Total</th>
<th>Action</th>
<th>Created</th>
<th>Updated</th>
</tr>
</thead>

<tbody>

{sales.length === 0 ? (
<tr>
<td colSpan="13" className="sales-empty">
No Sales Records
</td>
</tr>
) : (
sales.map((item) => (
<tr key={item.id}>
<td>{item.id}</td>
<td>{item.customer}</td>
<td>{item.productName}</td>
<td>{item.quantity}</td>
<td>{item.price}</td>
<td>{item.sgst}</td>
<td>{item.cgst}</td>
<td>{item.subTotal}</td>
<td>{item.gstAmount}</td>
<td>{item.totalAmount}</td>

<td>
<button
className="sales-delete-btn"
onClick={() => deleteSale(item.id)}
>
Delete
</button>
</td>

<td>{item.created}</td>
<td>{item.updated}</td>

</tr>
))
)}

</tbody>

</table>

</div>

{/* BANK DETAILS */}

<div className="bank-section">

<div className="bank-card">

<label>

<input
type="radio"
name="bank"
checked={selectedBank === "bank1"}
onChange={() => setSelectedBank("bank1")}
/>

<h4>Pay To</h4>

<p>Bank Name: BANK OF BARODA</p>
<p>Bank Account No: 75220200001446</p>
<p>Bank IFSC Code: BARBOVJMAAN</p>
<p>Account Holder's Name: SHREE AANDAVAR TOOLING</p>

</label>

</div>

</div>

{/* PDF */}

<div className="sales-pdf-btn">
<InvoicePDF sale={saleData} />
</div>

</div>
);
}

export default SalesPage;