import React, { useState } from "react";

export default function Products({ products, loading, onCreate, onUpdate, onDelete, addToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: ""
  });

  // Filter products by search term
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", sku: "", price: "", quantity: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Front-end Validations
    const priceNum = parseFloat(formData.price);
    const quantityNum = parseInt(formData.quantity, 10);

    if (!formData.name.trim() || !formData.sku.trim()) {
      addToast("Validation Error", "Name and SKU must not be blank.", "error");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast("Validation Error", "Price must be greater than ₹0.00.", "error");
      return;
    }
    if (isNaN(quantityNum) || quantityNum < 0) {
      addToast("Validation Error", "Inventory quantity cannot be negative.", "error");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      price: priceNum,
      quantity: quantityNum
    };

    try {
      if (editingProduct) {
        await onUpdate(editingProduct.id, payload);
      } else {
        await onCreate(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Errors are handled by the callback or api interceptor
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you absolutely sure you want to remove '${name}'? This will permanently delete this product from the inventory database.`)) {
      onDelete(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Products Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Product Inventory</h1>
          <p>Create, update, and manage your products and stock counts.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Catalog Table Container */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Product Catalogue ({filteredProducts.length})</span>
          <div className="table-search-box">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="table-search-input"
              placeholder="Search by Name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p style={{ fontWeight: 600 }}>No products found</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {searchTerm ? "Try modifying your search term." : "Start by adding a new product to your inventory."}
            </p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU / Code</th>
                  <th>Unit Price</th>
                  <th>In Stock</th>
                  <th>Inventory Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLowStock = product.quantity < 5;
                  const isOutOfStock = product.quantity === 0;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600 }}>{product.name}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>ID: #{product.id}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.85rem" }}>
                          {product.sku}
                        </code>
                      </td>
                      <td style={{ color: "var(--color-success)", fontWeight: 600 }}>
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {product.quantity}
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Healthy</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(product)} title="Edit Details">
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id, product.name)} title="Remove Product">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Glassmorphic Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="modal-title">
              {editingProduct ? "Modify Product Details" : "Register New Product"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Ergonomic Office Desk"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Code (Unique identifier)</label>
                <input
                  type="text"
                  name="sku"
                  className="form-input"
                  placeholder="e.g. DESK-ERG-10"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingProduct} // SKU modification not standard in CRUD unless safe
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹ INR)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity in Stock</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-input"
                    placeholder="0"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
