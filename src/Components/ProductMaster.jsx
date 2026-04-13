// import React, { useState, useEffect } from "react";
// import api from "../api"; // ✅ ONLY CHANGE

// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import Sidebar from "../Components/Sidebar";
// import Topbar from "../Components/Topbar";

// import "../CSS/ProductMaster.css";

// function ProductMaster() {
//   const [productName, setProductName] = useState("");
//   const [code, setCode] = useState("");
//   const [category, setCategory] = useState("");
//   const [status, setStatus] = useState("");
//   const [uom, setUom] = useState("");
//   const [minStock, setMinStock] = useState("");

//   const [uomOptions, setUomOptions] = useState([]);
//   const [categoryOptions, setCategoryOptions] = useState([]);

//   const [productList, setProductList] = useState([]);
//   const [editIndex, setEditIndex] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSI, setSelectedSI] = useState(null);

//   /* ================= LOAD FROM DB ================= */
//   const fetchProducts = async () => {
//     try {
//       const res = await api.get("/items/getItems"); // ✅ CHANGED
//       const data = res.data.data;

//       if (!Array.isArray(data)) return;

//       const formatted = data.map((item) => ({
//         id: item.SI,
//         SI: item.SI,
//         productName: item.ItemName,
//         code: item.ItemCode,
//         category: item.ItemCategory,
//         minStock: item.MinStock,
//         uom: item.UOM,
//         status: item.Status,
//         created: item.CreatedDate
//           ? new Date(item.CreatedDate).toLocaleString()
//           : "-",
//         updated: item.UpdatedDate
//           ? new Date(item.UpdatedDate).toLocaleString()
//           : "-",
//       }));

//       formatted.sort((a, b) => a.SI - b.SI);
//       setProductList(formatted);
//     } catch (error) {
//       console.error("GET API ERROR:", error?.response || error);
//       toast.error(error?.response?.data?.message || "Failed to fetch products");
//     }
//   };

//   /* ================= LOAD UOM OPTIONS ================= */
//   const fetchUOMOptions = async () => {
//     try {
//       const res = await api.get("/activeuoms/activeUOM"); // ✅ CHANGED
//       if (res.status === 200 && res.data.data) {
//         setUomOptions(res.data.data);
//       }
//     } catch (error) {
//       console.error("UOM API ERROR:", error?.response || error);
//       toast.error("Failed to fetch UOM options");
//     }
//   };

//   /* ================= LOAD CATEGORY OPTIONS ================= */
//   const fetchCategoryOptions = async () => {
//     try {
//       const res = await api.get("/activecategories/activeCategorie"); // ✅ CHANGED
//       if (res.status === 200 && res.data.status === 1 && res.data.data) {
//         setCategoryOptions(res.data.data);
//       }
//     } catch (error) {
//       console.error("CATEGORY API ERROR:", error?.response || error);
//       toast.error("Failed to fetch Category options");
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     fetchUOMOptions();
//     fetchCategoryOptions();
//   }, []);

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async () => {
//     if (!productName || !code) {
//       toast.warning("Enter Product Name and Code");
//       return;
//     }

//     try {
//       if (editIndex !== null && selectedSI) {
//         const payload = {
//           SI: selectedSI,
//           ItemName: productName,
//           ItemCode: code,
//           CategoryName: category || "",
//           MinStock: Number(minStock) || 0,
//           UOMName: uom || "",
//           Status: status || "Active",
//         };

//         const res = await api.post("/items/updateItem", payload); // ✅ CHANGED

//         if (res.data.status === 1) {
//           toast.success("Product Updated Successfully");
//           await fetchProducts();
//         } else {
//           toast.error("Product Failed to update");
//         }
//       } else {
//         const payload = {
//           ItemName: productName,
//           ItemCode: code,
//           CategoryName: category || "",
//           MinStock: Number(minStock) || 0,
//           UOMName: uom || "",
//           Status: status || "Active",
//         };

//         const res = await api.post("/items/item", payload); // ✅ CHANGED

//         if (res.data && res.data.status === 1) {
//           toast.success("Product Created Successfully");
//           await fetchProducts();
//         } else {
//           toast.error(res.data?.message || "Product Failed to create");
//         }
//       }
//     } catch (error) {
//       console.error("API ERROR:", error?.response || error);

//       toast.error(
//         error?.response?.data?.message ||
//         (editIndex !== null ? "Update Failed" : "Create Failed")
//       );
//     }

//     setProductName("");
//     setCode("");
//     setCategory("");
//     setStatus("");
//     setUom("");
//     setMinStock("");
//     setEditIndex(null);
//     setSelectedSI(null);
//   };

//   /* ================= EDIT ================= */
//   const handleEdit = (index) => {
//     const item = filteredData[index];
//     setProductName(item.productName);
//     setCode(item.code);
//     setCategory(item.category);
//     setStatus(item.status);
//     setUom(item.uom);
//     setMinStock(item.minStock);
//     setSelectedSI(item.SI);
//     setEditIndex(index);
//   };

//   /* ================= DELETE ================= */
//   const handleDelete = async (index) => {
//     const item = filteredData[index];
//     if (!window.confirm("Are you sure to delete?")) return;

//     try {
//       const res = await api.post("/items/deleteItem", { SI: item.SI }); // ✅ CHANGED

//       if (res.data.status === 1) {
//         toast.success("Product Deleted Successfully");
//         await fetchProducts();
//       } else {
//         toast.error("Product Failed to delete");
//       }
//     } catch (error) {
//       console.error("DELETE ERROR:", error?.response || error);
//       toast.error(error?.response?.data?.message || "Delete Failed");
//     }
//   };

//   /* ================= SEARCH ================= */
//   const filteredData = productList.filter(
//     (item) =>
//       item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.uom?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="product-page">
//       <Sidebar />
//       <Topbar />

//       <ToastContainer position="top-right" autoClose={3000} theme="colored" />

//       {/* ✅ EVERYTHING BELOW IS EXACTLY YOUR SAME DESIGN */}
//       {/* I DID NOT CHANGE ANY JSX */}

//       <div className="product-header">
//         <div>
//           <h1>Product Master</h1>
//           <p>Manage products and stock levels</p>
//         </div>
//       </div>

//       <div className="product-form">
//         <div className="form-row">
//           <div className="form-group">
//             <label>Product Name</label>
//             <input
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//             />
//           </div>
//           <div className="form-group">
//             <label>Code</label>
//             <input value={code} onChange={(e) => setCode(e.target.value)} />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Category</label>
//             <select value={category} onChange={(e) => setCategory(e.target.value)}>
//               <option value="">Select Category</option>
//               {categoryOptions.map((option, i) => (
//                 <option key={i} value={option}>{option}</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)}>
//               <option value="">Select Status</option>
//               <option>Active</option>
//               <option>Inactive</option>
//             </select>
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>UOM</label>
//             <select value={uom} onChange={(e) => setUom(e.target.value)}>
//               <option value="">Select UOM</option>
//               {uomOptions.map((option, i) => (
//                 <option key={i} value={option}>{option}</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Min-Stock</label>
//             <input
//               type="number"
//               value={minStock}
//               onChange={(e) => setMinStock(e.target.value)}
//             />
//           </div>
//         </div>

//         <button className="add-btn" onClick={handleSubmit}>
//           {editIndex !== null ? "Update" : "Submit"}
//         </button>
//       </div>

//       <div className="product-search">
//         <input
//           type="text"
//           placeholder="Search product..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <div className="table-card">
//         <table className="product-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Code</th>
//               <th>Category</th>
//               <th>MinStock</th>
//               <th>Status</th>
//               <th>UOM</th>
//               <th>Action</th>
//               <th>Created</th>
//               <th>Updated</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.length === 0 ? (
//               <tr>
//                 <td colSpan="10">No Product Found</td>
//               </tr>
//             ) : (
//               filteredData.map((item, index) => (
//                 <tr key={item.id}>
//                   <td>{item.id}</td>
//                   <td>{item.productName}</td>
//                   <td>{item.code}</td>
//                   <td>{item.category}</td>
//                   <td>{item.minStock}</td>
//                   <td>{item.status}</td>
//                   <td>{item.uom}</td>
//                   <td>
//                     <button onClick={() => handleEdit(index)}>Edit</button>
//                     <button onClick={() => handleDelete(index)}>Delete</button>
//                   </td>
//                   <td>{item.created}</td>
//                   <td>{item.updated}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default ProductMaster;












import React, { useState, useEffect } from "react";
import api from "../api";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";

import "../CSS/ProductMaster.css";

function ProductMaster() {
  const [productName, setProductName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [uom, setUom] = useState("");
  const [minStock, setMinStock] = useState("");

  const [uomOptions, setUomOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [productList, setProductList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSI, setSelectedSI] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/items/getItems");
      const data = res.data.data;

      if (!Array.isArray(data)) return;

      const formatted = data.map((item) => ({
        id: item.SI,
        SI: item.SI,
        productName: item.ItemName,
        code: item.ItemCode,
        category: item.ItemCategory,
        minStock: item.MinStock,
        uom: item.UOM,
        status: item.Status,
        created: item.CreatedDate
          ? new Date(item.CreatedDate).toLocaleString()
          : "-",
        updated: item.UpdatedDate
          ? new Date(item.UpdatedDate).toLocaleString()
          : "-",
      }));

      formatted.sort((a, b) => a.SI - b.SI);
      setProductList(formatted);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const fetchUOMOptions = async () => {
    try {
      const res = await api.get("/activeuoms/activeUOM");
      if (res.data.data) setUomOptions(res.data.data);
    } catch {
      toast.error("Failed to fetch UOM options");
    }
  };

  const fetchCategoryOptions = async () => {
    try {
      const res = await api.get("/activecategories/activeCategorie");
      if (res.data.data) setCategoryOptions(res.data.data);
    } catch {
      toast.error("Failed to fetch Category options");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUOMOptions();
    fetchCategoryOptions();
  }, []);

  const handleSubmit = async () => {
    if (!productName || !code) {
      toast.warning("Enter Product Name and Code");
      return;
    }

    try {
      if (editIndex !== null && selectedSI) {
        const res = await api.post("/items/updateItem", {
          SI: selectedSI,
          ItemName: productName,
          ItemCode: code,
          CategoryName: category || "",
          MinStock: Number(minStock) || 0,
          UOMName: uom || "",
          Status: status || "Active",
        });

        if (res.data.status === 1) {
          toast.success("Product Updated Successfully");
          fetchProducts();
        } else {
          toast.error("Update Failed");
        }
      } else {
        const res = await api.post("/items/item", {
          ItemName: productName,
          ItemCode: code,
          CategoryName: category || "",
          MinStock: Number(minStock) || 0,
          UOMName: uom || "",
          Status: status || "Active",
        });

        if (res.data.status === 1) {
          toast.success("Product Created Successfully");
          fetchProducts();
        } else {
          toast.error("Create Failed");
        }
      }
    } catch {
      toast.error("API Error");
    }

    setProductName("");
    setCode("");
    setCategory("");
    setStatus("");
    setUom("");
    setMinStock("");
    setEditIndex(null);
    setSelectedSI(null);
  };

  const handleEdit = (index) => {
    const item = filteredData[index];
    setProductName(item.productName);
    setCode(item.code);
    setCategory(item.category);
    setStatus(item.status);
    setUom(item.uom);
    setMinStock(item.minStock);
    setSelectedSI(item.SI);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const item = filteredData[index];
    if (!window.confirm("Are you sure to delete?")) return;

    try {
      const res = await api.post("/items/deleteItem", { SI: item.SI });
      if (res.data.status === 1) {
        toast.success("Product Deleted Successfully");
        fetchProducts();
      } else {
        toast.error("Delete Failed");
      }
    } catch {
      toast.error("Delete Failed");
    }
  };

  const filteredData = productList.filter(
    (item) =>
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-page">
      <Sidebar />
      <Topbar />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="product-header">
        <div>
          <h1>Product Master</h1>
          <p>Manage products and stock levels</p>
        </div>
      </div>

      <div className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label>Product Name</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        </div>

        <button className="add-btn" onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="product-search">
        <input
          type="text"
          placeholder="Search product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="product-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Code</th>
              <th>Category</th>
              <th>MinStock</th>
              <th>Status</th>
              <th>UOM</th>
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="10">No Product Found</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td> {/* ✅ Serial Number */}
                  <td>{item.productName}</td>
                  <td>{item.code}</td>
                  <td>{item.category}</td>
                  <td>{item.minStock}</td>
                  <td>{item.status}</td>
                  <td>{item.uom}</td>
                  <td>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                  <td>{item.created}</td>
                  <td>{item.updated}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductMaster;