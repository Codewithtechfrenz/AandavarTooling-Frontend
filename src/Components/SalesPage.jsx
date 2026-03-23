import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ changed from axios
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import InvoicePDF from "../Components/InvoicePDF";
import "../CSS/SalesPage.css";

function SalesPage(){

const [sales,setSales] = useState([]);

const [productName,setProductName] = useState("");
const [quantity,setQuantity] = useState("");
const [price,setPrice] = useState("");
const [sgst,setSgst] = useState("");
const [cgst,setCgst] = useState("");

const [selectedBank,setSelectedBank] = useState("bank1");

const [productOptions,setProductOptions] = useState([]); // ✅ NEW

const subTotal = quantity && price ? quantity * price : 0;
const gstTotal = subTotal + (subTotal * ((Number(sgst)+Number(cgst))/100));

/* ================= FETCH PRODUCT OPTIONS ================= */
useEffect(()=>{
  const fetchProducts = async () => {
    try {
      const res = await api.get("/activesalesproduct/activesalesproducts"); // ✅ changed

      if(res.status === 200 && res.data.data){
        setProductOptions(res.data.data);
      }
    } catch(err){
      console.error("Product API Error:", err);
    }
  };

  fetchProducts();
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


const addSales = () => {

if(!productName) return;

const newSale = {
id: sales.length + 1,
productName,
quantity,
price,
cgst,
subTotal,
gstTotal,
created:new Date().toLocaleDateString(),
updated:new Date().toLocaleDateString()
};

setSales([...sales,newSale]);

setProductName("");
setQuantity("");
setPrice("");
setSgst("");
setCgst("");

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

<div className="sales-group">
<label>Product Name</label>

<select
value={productName}
onChange={(e)=>setProductName(e.target.value)}
>
<option value="">Select Product</option>

{/* ✅ API DROPDOWN */}
{productOptions.map((option, i) => (
  <option key={i} value={option}>
    {option}
  </option>
))}

</select>

</div>

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
<th>Product Name</th>
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
<td colSpan="10" className="sales-empty">
No Sales Records
</td>
</tr>

):(sales.map((item)=>(
<tr key={item.id}>
<td>{item.id}</td>
<td>{item.productName}</td>
<td>{item.quantity}</td>
<td>{item.price}</td>
<td>{item.cgst}</td>
<td>{item.subTotal}</td>
<td>{item.gstTotal}</td>

<td>
<button className="sales-edit-btn">Edit</button>
<button className="sales-delete-btn">Delete</button>
</td>

<td>{item.created}</td>
<td>{item.updated}</td>

</tr>
)))}

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


<div className="bank-card">

<label>

<input
type="radio"
name="bank"
checked={selectedBank==="bank2"}
onChange={()=>setSelectedBank("bank2")}
/>

<h4>Pay To</h4>

<p>Bank Name: xxxxxx</p>
<p>Bank Account No: xxxxxx</p>
<p>Bank IFSC Code: xxxxxx</p>
<p>Bank Holder's Name: xxxxxx</p>

</label>

</div>

</div>


{/* PDF BUTTON */}

<div className="sales-pdf-btn">

<InvoicePDF sale={saleData}/>

</div>


</div>

);

}

export default SalesPage;