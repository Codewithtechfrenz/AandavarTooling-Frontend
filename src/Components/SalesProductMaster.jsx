import React, { useState, useEffect } from "react";
import api from "../api";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/SalesProductMaster.css";

function SalesProductMaster() {
  const [products, setProducts] = useState([]); // Newly added products
  const [salesProducts, setSalesProducts] = useState([]); // Fetched from backend
  const [productName, setProductName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch sales products from backend
  useEffect(() => {
    const fetchSalesProducts = async () => {
      try {
        const response = await api.get(
          "/sales/getSalesProducts"
        );

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            setSalesProducts(response.data);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setSalesProducts(response.data.data);
          } else {
            console.warn("Unexpected response structure:", response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching sales products:", error);
      }
    };

    fetchSalesProducts();
  }, []);

  // Add new product
  const addProduct = async () => {
    if (!productName) return;

    try {
      const response = await api.post(
        "/sales/createSalesProduct",
        { Product_Name: productName }
      );

      if (response.status === 200) {
        const newProduct = {
          id: products.length + 1,
          name: productName,
          createdDate: new Date().toLocaleDateString(),
          updatedDate: new Date().toLocaleDateString(),
        };
        setProducts([...products, newProduct]);
        setProductName("");
        alert("Product added successfully!");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Error adding product");
    }
  };

  // Update product
  const handleEdit = async (product) => {
    // Only backend products can be updated
    const backendProduct = salesProducts.find((p) => p.S_No === product.id);
    if (!backendProduct) {
      alert("Cannot edit this product until it exists in backend");
      return;
    }

    const newName = prompt("Enter new product name:", product.name);
    if (!newName || newName === product.name) return;

    try {
      const payload = {
        S_No: backendProduct.S_No,
        Product_Name: newName,
      };

      const response = await api.post(
        "/sales/updateSalesProduct",
        payload
      );

      if (response.status === 200) {
        const updatedSalesProducts = salesProducts.map((p) =>
          p.S_No === payload.S_No ? { ...p, Product_Name: newName } : p
        );
        setSalesProducts(updatedSalesProducts);
        alert("Product updated successfully!");
      } else {
        alert("Failed to update product via API");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Error updating product");
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    const backendProduct = salesProducts.find((p) => p.S_No === product.id);
    if (!backendProduct) {
      alert("Cannot delete this product until it exists in backend");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const payload = { S_No: backendProduct.S_No };
      const response = await api.post(
        "/sales/deleteSalesProduct",
        payload
      );

      if (response.status === 200) {
        const updatedSalesProducts = salesProducts.filter(
          (p) => p.S_No !== payload.S_No
        );
        setSalesProducts(updatedSalesProducts);
        alert("Product deleted successfully!");
      } else {
        alert("Failed to delete product via API");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Error deleting product");
    }
  };

  // Combine backend and local products
  const combinedProducts = [
    ...salesProducts.map((p) => ({
      id: p.S_No,
      name: p.Product_Name,
      createdDate: p.created_at
        ? new Date(p.created_at).toLocaleDateString()
        : "-",
      updatedDate: p.updated_at
        ? new Date(p.updated_at).toLocaleDateString()
        : "-",
    })),
    ...products,
  ];

  const filteredProducts = combinedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sales-product-page">
      <Sidebar />
      <Topbar />

      {/* HEADER */}
      <div className="sales-product-header">
        <div>
          <h1>Sales Product Master</h1>
          <p>Manage Sales Products</p>
        </div>
      </div>

      {/* FORM */}
      <div className="sales-product-form">
        <div className="sales-form-row">
          <div className="sales-form-group">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="Enter Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
        </div>

        <button className="sales-add-btn" onClick={addProduct}>
          Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="category-search">
        <i className="fa fa-search"></i>
        <input
          type="text"
          placeholder="Search Product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="sales-table-card">
        <table className="sales-product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="sales-empty">
                  No Products Found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.createdDate}</td>
                  <td>{product.updatedDate}</td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Edit</button>
                    <button onClick={() => handleDelete(product)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesProductMaster;