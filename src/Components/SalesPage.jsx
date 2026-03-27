import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import InvoicePDF from "../Components/InvoicePDF";
import "../CSS/SalesPage.css";

function SalesPage(){

const [sales,setSales] = useState([]);

const [customer,setCustomer] = useState("");
const [productName,setProductName] = useState("");
const [description,setDescription] = useState("");
const [quantity,setQuantity] = useState("");
const [price,setPrice] = useState("");
const [sgst,setSgst] = useState("");
const [cgst,setCgst] = useState("");

const [selectedBank,setSelectedBank] = useState("bank1");

const [productOptions,setProductOptions] = useState([]);
const [customerOptions,setCustomerOptions] = useState([]);

const subTotal = quantity && price ? quantity * price : 0;
const gstTotal = subTotal + (subTotal * ((Number(sgst)+Number(cgst))/100));

/* ================= FETCH PRODUCTS ================= */
useEffect(()=>{
  const fetchProducts = async () => {
    try {
      const res = await api.get("/activeitems/activeitem");
      setProductOptions(res.data?.data || []);
    } catch(err){
      console.error("Product Error:", err);
      setProductOptions([]);
    }
  };
  fetchProducts();
},[]);

/* ================= FETCH CUSTOMERS ================= */
useEffect(()=>{
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/acticustomers/getdropCustomers");
      setCustomerOptions(res.data?.data || []);
    } catch(err){
      console.error("Customer Error:", err);
      setCustomerOptions([]);
    }
  };
  fetchCustomers();
},[]);

const saleData = {
id:198,
date:"28-02-2026",
customerName:"PKM AUTOCOM (P) LTD",
customerAddress:"Madurai",
product:"70423 1333",
quantity:12550,
price:5.75,
gst:18,
subtotal:72162.5,
gstAmount:12989.25,
total:85151.75
};

/* ================= ADD SALES ================= */
const addSales = async () => {

if(!productName || !customer) return;

const payload = {
  customer_name: customer,
  product_name: productName,
  description: description,
  quantity: Number(quantity),
  price: Number(price),
  sgst: Number(sgst),
  cgst: Number(cgst),
  subtotal: subTotal,
  total: gstTotal
};

try{

  const res = await api.post("/sales/addsales", payload);

  if(res.data?.status === 1){

    const newSale = {
      id: sales.length + 1,
      customer,
      productName,
      description,
      quantity,
      price,
      cgst,
      subTotal,
      gstTotal,
      created:new Date().toLocaleDateString(),
      updated:new Date().toLocaleDateString()
    };

    setSales([...sales,newSale]);

    setCustomer("");
    setProductName("");
    setDescription("");
    setQuantity("");
    setPrice("");
    setSgst("");
    setCgst("");

  }else{
    alert(res.data?.message || "Failed");
  }

}catch(err){
  console.error("Sales Save Error:", err);
  alert("Server Error");
}

};

/* ================= DELETE SALES ================= */
const deleteSale = async (id) => {

const confirmDelete = window.confirm("Are you sure?");
if(!confirmDelete) return;

try{
  // await api.delete(`/sales/deletesales/${id}`);
  const updated = sales.filter((item)=>item.id !== id);
  setSales(updated);
}catch(err){
  console.error("Delete Error:", err);
}

};

return(

<div className="sales-page">

<Sidebar/>
<Topbar/>

{/* HEADER */}

<div className="sales-header">
<h1>Sales Page</h1>
<p>Manage Sales Transactions</p>
</div>

{/* FORM */}

<div className="sales-form">

<div className="sales-row">

{/* CUSTOMER */}
<div className="sales-group">
<label>Customer</label>
<select
value={customer}
onChange={(e)=>setCustomer(e.target.value)}
>
<option value="">Select Customer</option>

{customerOptions.map((cust, i) => (
  <option key={i} value={cust.CustomerName}>
    {cust.CustomerName}
  </option>
))}

</select>
</div>

{/* PRODUCT */}
<div className="sales-group">
<label>Product Name</label>

<select
value={productName}
onChange={(e)=>{
  const selected = productOptions.find(
    (p)=>p.ItemName === e.target.value
  );

  setProductName(e.target.value);

  if(selected){
    setPrice(selected.Price || "");
  }
}}
>
<option value="">Select Product</option>

{productOptions.map((option, i) => (
  <option key={i} value={option.ItemName}>
    {option.ItemName}
  </option>
))}

</select>

</div>

</div>

{/* DESCRIPTION */}

<div className="sales-row">
<div className="sales-group">
<label>Description</label>
<input
type="text"
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>
</div>
</div>

<div className="sales-row">

<div className="sales-group">
<label>Quantity</label>
<input
type="number"
value={quantity}
onChange={(e)=>setQuantity(e.target.value)}
/>
</div>

</div>

<div className="sales-row">

<div className="sales-group">
<label>Price</label>
<input
type="number"
value={price}
onChange={(e)=>setPrice(e.target.value)}
/>
</div>

<div className="sales-group">
<label>SGST</label>
<input
type="number"
value={sgst}
onChange={(e)=>setSgst(e.target.value)}
/>
</div>

<div className="sales-group">
<label>CGST</label>
<input
type="number"
value={cgst}
onChange={(e)=>setCgst(e.target.value)}
/>
</div>

</div>

<div className="sales-row">

<div className="sales-group">
<label>Sub Total Amount</label>
<input type="text" value={subTotal} readOnly/>
</div>

<div className="sales-group">
<label>With GST Amount</label>
<input type="text" value={gstTotal} readOnly/>
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
<th>Product Name</th>
<th>Description</th>
<th>Quantity</th>
<th>Price</th>
<th>CGST</th>
<th>Sub Total Amount</th>
<th>With GST Amount</th>
<th>Action</th>
<th>Created</th>
<th>Updated</th>
</tr>
</thead>

<tbody>

{sales.length === 0 ?(

<tr>
<td colSpan="12" className="sales-empty">
No Sales Records
</td>
</tr>

):(sales.map((item)=>(
<tr key={item.id}>
<td>{item.id}</td>
<td>{item.customer}</td>
<td>{item.productName}</td>
<td>{item.description}</td>
<td>{item.quantity}</td>
<td>{item.price}</td>
<td>{item.cgst}</td>
<td>{item.subTotal}</td>
<td>{item.gstTotal}</td>

<td>
<button className="sales-edit-btn">Edit</button>
<button
className="sales-delete-btn"
onClick={()=>deleteSale(item.id)}
>
Delete
</button>
</td>

<td>{item.created}</td>
<td>{item.updated}</td>

</tr>
)))}

</tbody>

</table>

</div>

{/* BANK */}

<div className="bank-section">

<div className="bank-card">

<label>

<input
type="radio"
name="bank"
checked={selectedBank==="bank1"}
onChange={()=>setSelectedBank("bank1")}
/>

<h4>Pay To</h4>

<p>Bank Name: xxxxxx</p>
<p>Bank Account No: xxxxxx</p>
<p>Bank IFSC Code: xxxxxx</p>
<p>Bank Holder's Name: xxxxxx</p>

</label>

</div>

</div>

{/* PDF */}

<div className="sales-pdf-btn">
<InvoicePDF sale={saleData}/>
</div>

</div>

);

}

export default SalesPage;