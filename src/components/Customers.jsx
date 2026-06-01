import React, { useState } from "react";

export default function Customers({ customers, loading, onCreate, onDelete, addToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });

  // Filter customers by search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({ fullName: "", email: "", phoneNumber: "" });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Front-end email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      addToast("Validation Error", "Full name is required.", "error");
      return;
    }
    if (!emailRegex.test(formData.email.trim())) {
      addToast("Validation Error", "Please provide a valid email address.", "error");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      addToast("Validation Error", "Phone number is required.", "error");
      return;
    }

    const payload = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phoneNumber.trim()
    };

    try {
      await onCreate(payload);
      setIsModalOpen(false);
    } catch (err) {
      // Handled by the api client or root error handlers
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you absolutely sure you want to remove customer '${name}'? This will permanently delete their account and all associated order history.`)) {
      onDelete(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Customer Management</h1>
          <p>Register new clients and view their accounts details.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Customer Records ({filteredCustomers.length})</span>
          <div className="table-search-box">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="table-search-input"
              placeholder="Search by Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && customers.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading customer database...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p style={{ fontWeight: 600 }}>No customers found</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {searchTerm ? "Try modifying your search term." : "Start by registering your first customer profile."}
            </p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifySpace: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.9rem" }}>
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600 }}>{customer.full_name}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>Customer ID: #{customer.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{customer.email}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{customer.phone_number}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(customer.id, customer.full_name)} title="Remove Account">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="modal-title">Register New Customer</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Unique)</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="e.g. john.doe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="e.g. +1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
