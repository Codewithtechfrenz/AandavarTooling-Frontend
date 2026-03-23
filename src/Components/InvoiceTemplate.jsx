import React from "react";
import "../CSS/InvoiceTemplate.css";

function InvoiceTemplate() {

return (

<div id="invoice" className="invoice-container">

{/* TOP BAR */}

<div className="top-bar">
<div>📞 9944130610</div>
<div>✉ prabusangari60@gmail.com</div>
<div>📍 1/56 Alakanniam ambalakaranpatti Madurai</div>
</div>


{/* COMPANY HEADER */}

<div className="company-header">

<div className="company-left">

<h2>SHREE AANDAVAR TOOLING</h2>

<p>GSTIN: 33BYPPP7144R1Z0</p>
<p>State: 33-Tamil Nadu</p>

</div>

<div className="invoice-title">
<h1>Tax Invoice</h1>
</div>

</div>


{/* BILL + INVOICE DETAILS */}

<div className="bill-details">

<div className="bill-left">

<h4>Bill To</h4>

<p><b>PKM AUTOCOM (P) LTD</b></p>
<p>malayalatham Patti kodikulam post madurai</p>
<p>Contact No: 9344033006</p>
<p>GSTIN Number: 33AAPPC5453D2ZM</p>
<p>State: 33-Tamil Nadu</p>

</div>

<div className="bill-right">

<p>Invoice No: ______</p>
<p>Date: ______</p>
<p>Place of Supply: ______</p>

</div>

</div>


{/* PRODUCT TABLE */}

<table className="invoice-table">

<thead>

<tr>
<th>#</th>
<th>Item Name</th>
<th>HSN/SAC</th>
<th>Quantity</th>
<th>Price/unit</th>
<th>GST</th>
<th>Amount</th>
</tr>

</thead>

<tbody>

<tr>
<td>1</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>

<tr>
<td>2</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>

</tbody>

</table>


{/* PAYMENT + TOTAL */}

<div className="payment-wrapper">

<div className="payto">

<h4>Pay To:</h4>

<p>Bank Name: Bank Of Baroda</p>
<p>Bank Account No: __________</p>
<p>Bank IFSC Code: __________</p>
<p>Account Holder's Name: SHREE AANDAVAR TOOLING</p>

</div>


<div className="total-box">

<table>

<tr>
<td>Sub Total</td>
<td>________</td>
</tr>

<tr>
<td>SGST</td>
<td>________</td>
</tr>

<tr>
<td>CGST</td>
<td>________</td>
</tr>

<tr className="total-row">
<td>Total</td>
<td>________</td>
</tr>

<tr>
<td>Received</td>
<td>________</td>
</tr>

<tr>
<td>Balance</td>
<td>________</td>
</tr>

<tr>
<td>Payment Mode</td>
<td>________</td>
</tr>

</table>

</div>

</div>


{/* AMOUNT WORDS */}

<div className="amount-words">

<p><b>Invoice Amount In Words</b></p>
<p>____________________________________________</p>

</div>


{/* TERMS */}

<div className="terms">

<p><b>Terms And Conditions</b></p>
<p>Thank you for doing business with us.</p>

</div>


{/* SIGNATURE */}

<div className="signature">

<p>For: SHREE AANDAVAR TOOLING</p>

<div className="sign-box"></div>

<p>Authorized Signatory</p>

</div>


{/* ACKNOWLEDGEMENT */}

<div className="ack-section">

<div className="ack-header">
ACKNOWLEDGEMENT
</div>

<div className="ack-content">

<div>

<p><b>Invoice To:</b></p>
<p>________________________</p>

</div>

<div>

<p><b>Invoice Details:</b></p>
<p>Invoice No: ______</p>
<p>Invoice Date: ______</p>
<p>Invoice Amount: ______</p>

</div>

<div>

<p>Receiver's Seal & Sign</p>
<div className="sign-box"></div>

</div>

</div>

</div>

</div>

);


}

export default InvoiceTemplate;