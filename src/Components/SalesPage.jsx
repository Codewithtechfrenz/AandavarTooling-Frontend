import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import InvoicePDF from "../Components/InvoicePDF";
import "../CSS/SalesPage.css";

function SalesPage() {

const [sales, setSales] = useState([]);
const [loading, setLoading] = useState(false);

const [customer, setCustomer] = useState("");
const [productName, setProductName] = useState("");
const [quantity, setQuantity] = useState("");
const [price, setPrice] = useState("");

const [sgst] = useState(9);
const [cgst] = useState(9);

const [editingId, setEditingId] = useState(null);

const [productOptions, setProductOptions] = useState([]);
const [customerOptions, setCustomerOptions] = useState([]);

const [selectedBank, setSelectedBank] = useState("bank1");

/* ================= CALCULATIONS ================= */

const subTotal = quantity && price ? quantity * price : 0;
const gstAmount = subTotal * ((sgst + cgst) / 100);
const totalAmount = subTotal + gstAmount;

/* ================= FETCH SALES ================= */

useEffect(() => {
fetchSales();
}, []);

const fetchSales = async () => {
try {

setLoading(true);

const res = await api.get("/sales/getSale");

if (res.data?.status === 1) {

const formatted = res.data.data.map((item) => ({
id: item.Sale_ID,
customer: item.customer_name,
productName: item.product_name,
quantity: Number(item.quantity),
price: Number(item.price),
sgst: Number(item.sgst),
cgst: Number(item.cgst),
subTotal: Number(item.subtotal),
gstAmount: Number(item.gst_total),
totalAmount: Number(item.total),
created: item.created_at
? new Date(item.created_at).toLocaleDateString()
: "-",
updated: item.updated_at
? new Date(item.updated_at).toLocaleDateString()
: "-"
}));

setSales(formatted);

} else {
setSales([]);
}

} catch (err) {
console.error("Fetch Sales Error:", err);
} finally {
setLoading(false);
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

/* ================= ADD / UPDATE SALES ================= */

const handleSaveSales = async () => {

if (!customer || !productName) {
alert("Customer and Product required");
return;
}

const payload = {
Sale_ID: editingId,
customer_name: customer,
product_name: productName,
quantity: Number(quantity),
price: Number(price),
sgst,
cgst,
subtotal: subTotal,
gst_total: gstAmount,
total: totalAmount
};

try {

let res;

if (editingId) {
res = await api.post("/sales/updateSales", payload);
} else {
res = await api.post("/sales/addsales", payload);
}

if (res.data?.status === 1) {

await fetchSales();
clearForm();

} else {
alert(res.data?.message || "Operation Failed");
}

} catch (err) {
console.error("Save Error:", err);
alert("Server Error");
}

};

/* ================= EDIT SALES ================= */

const editSale = (item) => {

setEditingId(item.id);
setCustomer(item.customer);
setProductName(item.productName);
setQuantity(item.quantity);
setPrice(item.price);

};

/* ================= DELETE SALES ================= */

const deleteSale = async (id) => {

const confirmDelete = window.confirm("Delete this sale?");
if (!confirmDelete) return;

try {

await api.delete(`/sales/deleteSales/${id}`);
await fetchSales();

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
setEditingId(null);
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
<select value={customer} onChange={(e) => setCustomer(e.target.value)}>
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

if (selected) setPrice(selected.Price || "");

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
<label>Sub Total</label>
<input type="text" value={subTotal} readOnly />
</div>

<div className="sales-group">
<label>GST Amount</label>
<input type="text" value={gstAmount} readOnly />
</div>

<div className="sales-group">
<label>Total</label>
<input type="text" value={totalAmount} readOnly />
</div>

</div>

<button className="sales-add-btn" onClick={handleSaveSales}>
{editingId ? "Update Sales" : "Add Sales"}
</button>

{editingId && (
<button className="sales-cancel-btn" onClick={clearForm}>
Cancel Edit
</button>
)}

</div>

{/* TABLE */}

<div className="sales-table-card">

{loading ? (
<h3>Loading Sales...</h3>
) : (
<table className="sales-table">

<thead>
<tr>
<th>ID</th>
<th>Customer</th>
<th>Product</th>
<th>Qty</th>
<th>Price</th>
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
<td colSpan="10">No Sales Records</td>
</tr>
) : (
sales.map((item) => (
<tr key={item.id}>
<td>{item.id}</td>
<td>{item.customer}</td>
<td>{item.productName}</td>
<td>{item.quantity}</td>
<td>{item.price}</td>
<td>{item.gstAmount}</td>
<td>{item.totalAmount}</td>

<td>

<button
className="sales-edit-btn"
onClick={() => editSale(item)}
>
Edit
</button>

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
)}

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
<p>Account No: 75220200001446</p>
<p>IFSC: BARBOVJMAAN</p>
<p>Account Holder: SHREE AANDAVAR TOOLING</p>

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