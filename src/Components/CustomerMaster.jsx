import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import "../CSS/CustomerMaster.css";
import api from "../api"; // Axios instance with baseURL

function CustomerMaster() {
  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null); // edit mode

  // ========== FETCH CUSTOMERS ==========
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers/getCustomers");

      if (res.data.status === 1 && Array.isArray(res.data.data)) {
        const formattedData = res.data.data.map((item) => ({
          id: item.S_No,
          name: item.Cus_Name,
          address: item.Cus_Address,
          phone: item.Cus_Phno,
          gstin: item.Cus_GSTIN,
          created: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
          updated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : new Date().toLocaleDateString(),
        }));

        setCustomers(formattedData);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ========== ADD OR UPDATE CUSTOMER ==========
  const saveCustomer = async () => {
    if (!customerName) return;

    let url = "/customers/createCustomer";
    let payload = {
      Cus_Name: customerName,
      Cus_Address: customerAddress,
      Cus_Phno: customerPhone,
      Cus_GSTIN: customerGSTIN,
    };

    if (editId !== null) {
      url = "/customers/updateCustomer";
      payload.S_No = Number(editId);
    }

    try {
      const res = await api.post(url, payload);

      if (res.data.status === 1 || res.data.success) {
        if (editId !== null) {
          setCustomers((prev) =>
            prev.map((item) =>
              item.id === editId
                ? {
                    ...item,
                    name: customerName,
                    address: customerAddress,
                    phone: customerPhone,
                    gstin: customerGSTIN,
                    updated: new Date().toLocaleDateString(),
                  }
                : item
            )
          );
        } else {
          fetchCustomers();
        }

        // Clear form
        setCustomerName("");
        setCustomerAddress("");
        setCustomerPhone("");
        setCustomerGSTIN("");
        setEditId(null);
      } else {
        alert("Operation failed");
      }
    } catch (error) {
      console.error("Save customer error:", error);
    }
  };

  // ========== DELETE CUSTOMER ==========
  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    try {
      const res = await api.post("/customers/deleteCustomer", { S_No: id });

      if (res.data.status === 1 || res.data.success) {
        setCustomers((prev) => prev.filter((item) => item.id !== id));
        if (editId === id) {
          setCustomerName("");
          setCustomerAddress("");
          setCustomerPhone("");
          setCustomerGSTIN("");
          setEditId(null);
        }
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error("Delete customer error:", error);
    }
  };

  // ========== EDIT CUSTOMER ==========
  const editCustomer = (item) => {
    setCustomerName(item.name);
    setCustomerAddress(item.address);
    setCustomerPhone(item.phone);
    setCustomerGSTIN(item.gstin);
    setEditId(item.id);
  };

  // SEARCH FILTER
  const filteredCustomers = customers.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-page">
      <Sidebar />
      <Topbar />

      {/* HEADER */}
      <div className="customer-header">
        <h1>Customer Master</h1>
        <p>Manage Customer Records</p>
      </div>

      {/* FORM */}
      <div className="customer-form">
        <div className="customer-form-row">
          <div className="customer-form-group">
            <label>Customer Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="customer-form-group">
            <label>Customer Address</label>
            <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
        </div>

        <div className="customer-form-row">
          <div className="customer-form-group">
            <label>Customer Phone No</label>
            <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <div className="customer-form-group">
            <label>Customer GSTIN</label>
            <input type="text" value={customerGSTIN} onChange={(e) => setCustomerGSTIN(e.target.value)} />
          </div>
        </div>

        <button className="customer-add-btn" onClick={saveCustomer}>
          {editId ? "Update Customer" : "Add Customer"}
        </button>
      </div>

      {/* SEARCH */}
      <div className="customer-search">
        <i className="fa fa-search"></i>
        <input type="text" placeholder="Search Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* TABLE */}
      <div className="customer-table-card">
        <table className="customer-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Customer Address</th>
              <th>Customer Phone No</th>
              <th>Customer GSTIN</th>
              <th>Action</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="customer-empty">No Customers Found</td>
              </tr>
            ) : (
              filteredCustomers.map((item) => (
                <tr key={item.id} className={editId === item.id ? "editing-row" : ""}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.address}</td>
                  <td>{item.phone}</td>
                  <td>{item.gstin}</td>

                  <td>
                    <button className="customer-edit-btn" onClick={() => editCustomer(item)}>
                      <i className="fa fa-edit"></i>
                    </button>

                    <button className="customer-delete-btn" onClick={() => deleteCustomer(item.id)}>
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

export default CustomerMaster;