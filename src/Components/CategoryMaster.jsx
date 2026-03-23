import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/CategoryMaster.css";
import api from "../api"; // Axios instance with baseURL

function CategoryMaster() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load categories from server or localStorage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/getCategories");
        if (res.data?.data) {
          const formattedData = res.data.data.map((item, index) => ({
            id: index + 1,
            SI: item.SI,
            categoryName: item.CategoryName,
            categoryCode: item.CategoryCode,
            description: item.Description,
            created: item.created_at || "-",
            updated: item.updated_at || "-",
          }));
          setCategories(formattedData);
          localStorage.setItem("categoryData", JSON.stringify(formattedData));
        } else {
          const stored = localStorage.getItem("categoryData");
          setCategories(stored ? JSON.parse(stored) : []);
        }
      } catch (error) {
        console.error("Fetch categories error:", error);
        const stored = localStorage.getItem("categoryData");
        setCategories(stored ? JSON.parse(stored) : []);
      }
    };

    fetchCategories();
  }, []);

  // Update local storage and state
  const updateStorage = (data) => {
    setCategories(data);
    localStorage.setItem("categoryData", JSON.stringify(data));
  };

  // Submit category (create or update)
  const handleSubmit = async () => {
    if (!categoryName || !categoryCode) {
      alert("Enter Category Name and Code");
      return;
    }

    let data = [...categories];

    if (editIndex !== null) {
      // Update existing
      try {
        const currentItem = data[editIndex];
        const res = await api.post("/categories/updateCategory", {
          SI: currentItem.SI,
          CategoryName: categoryName,
          CategoryCode: categoryCode,
          Description: description,
        });

        if (res.data.status === 0) throw new Error(res.data.message || "Update Failed");

        alert("Category updated successfully");

        data[editIndex] = {
          ...data[editIndex],
          categoryName,
          categoryCode,
          description,
          updated: new Date().toLocaleString(),
        };
        setEditIndex(null);
      } catch (error) {
        console.error("Update API Error:", error);
        alert("Failed to update in server");
        return;
      }
    } else {
      // Create new
      try {
        const res = await api.post("/categories/createCategory", {
          CategoryName: categoryName,
          CategoryCode: categoryCode,
          Description: description,
        });

        if (res.data.status === 0) throw new Error(res.data.message || "Create Failed");

        alert("Category created successfully");

        data.push({
          id: data.length + 1,
          SI: res.data?.data?.SI || Date.now(),
          categoryName,
          categoryCode,
          description,
          created: new Date().toLocaleString(),
          updated: "-",
        });
      } catch (error) {
        console.error("Create API Error:", error);
        alert("Failed to save in server");
        return;
      }
    }

    updateStorage(data);
    setCategoryName("");
    setCategoryCode("");
    setDescription("");
  };

  // Edit category
  const handleEdit = (index) => {
    const item = categories[index];
    setCategoryName(item.categoryName);
    setCategoryCode(item.categoryCode);
    setDescription(item.description);
    setEditIndex(index);
  };

  // Delete category
  const handleDelete = async (index) => {
    const item = categories[index];
    try {
      const res = await api.post("/categories/deleteCategory", { SI: item.SI });
      if (res.data.status === 0) throw new Error(res.data.message || "Delete Failed");

      alert("Category deleted successfully");

      const updatedData = categories
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, id: i + 1 }));
      updateStorage(updatedData);
    } catch (error) {
      console.error("Delete API Error:", error);
      alert("Failed to delete from server");
    }
  };

  // Filter categories based on search
  const filteredData = categories.filter(
    (item) =>
      item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-page">
      <Sidebar />
      <Topbar />

      <div className="category-header">
        <div>
          <h1>Category Master</h1>
          <p>Manage product categories</p>
        </div>
      </div>

      <div className="category-form">
        <div className="form-row">
          <div className="form-group">
            <label>Category Name</label>
            <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Category Code</label>
            <input type="text" value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <button className="add-btn" onClick={handleSubmit}>
          {editIndex !== null ? "Update" : "Submit"}
        </button>
      </div>

      <div className="category-search">
        <i className="fa fa-search"></i>
        <input
          type="text"
          placeholder="Search Category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="category-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Category Code</th>
              <th>Description</th>
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="category-empty">
                  No Category Found
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.categoryName}</td>
                  <td>{item.categoryCode}</td>
                  <td>{item.description}</td>
                  <td>
                    <button className="category-edit-btn" onClick={() => handleEdit(index)}>
                      <i className="fa fa-edit"></i>
                    </button>
                    <button className="category-delete-btn" onClick={() => handleDelete(index)}>
                      <i className="fa fa-trash"></i>
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
    </div>
  );
}

export default CategoryMaster;