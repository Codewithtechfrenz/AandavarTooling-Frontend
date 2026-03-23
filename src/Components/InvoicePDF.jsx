import React from "react";
import html2pdf from "html2pdf.js";
import InvoiceTemplate from "./InvoiceTemplate";
import "../CSS/InvoicePDF.css";

function InvoicePDF() {

const downloadPDF = () => {

const element = document.getElementById("invoice");

const opt = {
margin:0,
filename:"Empty_Invoice.pdf",
image:{type:"jpeg",quality:1},
html2canvas:{scale:2,scrollY:0},
jsPDF:{unit:"mm",format:[210,297],orientation:"portrait"},
pagebreak:{mode:["avoid-all"]}
};

html2pdf().set(opt).from(element).save();

};

return(

<div>

<button onClick={downloadPDF} className="download-btn">
Download Invoice PDF
</button>

<div className="pdf-hidden">
<InvoiceTemplate/>
</div>

</div>

);

}

export default InvoicePDF;