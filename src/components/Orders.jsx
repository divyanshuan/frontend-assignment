import React, { useState } from "react";

export default function Orders({ orders, products, customers, loading, onCreate, onDelete, addToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Create Order Form State
  const [customerId, setCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState([
    { product_id: "", quantity: 1 }
  ]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const handleAddRow = () => {
    setOrderItems((prev) => [...prev, { product_id: "", quantity: 1 }]);
  };

  const handleRemoveRow = (index) => {
    if (orderItems.length === 1) {
      addToast("Order Error", "An order must contain at least 1 product.", "error");
      return;
    }
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      if (field === "quantity") {
        const val = parseInt(value, 10);
        updated[index][field] = isNaN(val) ? "" : val;
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  // Live Total Calculation
  const calculateLiveTotal = () => {
    let total = 0;
    orderItems.forEach((item) => {
      if (item.product_id) {
        const product = products.find((p) => p.id === parseInt(item.product_id, 10));
        if (product && item.quantity > 0) {
          total += product.price * item.quantity;
        }
      }
    });
    return total;
  };

  const openAddModal = () => {
    if (customers.length === 0) {
      addToast("Action Required", "Please register at least one customer before creating an order.", "error");
      return;
    }
    if (products.length === 0) {
      addToast("Action Required", "Please add products to inventory before creating an order.", "error");
      return;
    }
    setCustomerId("");
    setOrderItems([{ product_id: "", quantity: 1 }]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      addToast("Validation Error", "Please select a customer.", "error");
      return;
    }

    // Process and validate items
    const processedItems = [];
    const seenProductIds = new Set();

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.product_id) {
        addToast("Validation Error", `Row ${i + 1}: Please select a product.`, "error");
        return;
      }

      const prodId = parseInt(item.product_id, 10);
      if (seenProductIds.has(prodId)) {
        addToast("Validation Error", "Duplicate products found. Please combine quantities into a single item line.", "error");
        return;
      }
      seenProductIds.add(prodId);

      const product = products.find((p) => p.id === prodId);
      if (!product) {
        addToast("Error", "Selected product does not exist.", "error");
        return;
      }

      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        addToast("Validation Error", `Row ${i + 1}: Quantity must be greater than zero.`, "error");
        return;
      }

      if (product.quantity < quantity) {
        addToast("Stock Shortage", `Row ${i + 1}: Insufficient inventory for '${product.name}'. Available: ${product.quantity}, Requested: ${quantity}.`, "error");
        return;
      }

      processedItems.push({
        product_id: prodId,
        quantity: quantity
      });
    }

    const payload = {
      customer_id: parseInt(customerId, 10),
      items: processedItems
    };

    try {
      await onCreate(payload);
      setIsModalOpen(false);
    } catch (err) {
      // Handled by API interceptor
    }
  };

  const handleCancelOrder = (id) => {
    if (window.confirm(`Are you sure you want to cancel and delete Order #${id}? The associated inventory quantities will be restocked automatically.`)) {
      onDelete(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Order Management</h1>
          <p>Create, track, review, and cancel client invoices.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Create Order
        </button>
      </div>

      {/* Orders Table list */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Order Timeline & Receipts ({orders.length})</span>
        </div>

        {loading && orders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            Fetching orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ fontWeight: 600 }}>No orders placed yet</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Click 'Create Order' to process a new transaction.
            </p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Products Purchased</th>
                  <th>Total Amount</th>
                  <th style={{ textAlign: "right" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Sum total items in the order
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td>
                          <span style={{ fontWeight: 600 }}>Invoice #{order.id}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 500 }}>{order.customer?.full_name || "Deleted Customer"}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{order.customer?.email}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{formattedDate}</span>
                        </td>
                        <td>
                          <span className="badge badge-primary">{itemsCount} {itemsCount === 1 ? "item" : "items"}</span>
                        </td>
                        <td style={{ color: "var(--color-success)", fontWeight: 600 }}>
                          ₹{order.total_amount.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleExpandOrder(order.id)}>
                            {isExpanded ? "Collapse" : "View"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="order-row-detail">
                            <div className="detail-section">
                              <div className="detail-columns">
                                {/* Customer Summary */}
                                <div className="detail-block">
                                  <h4>Customer Information</h4>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                                    <p><strong>Name:</strong> {order.customer?.full_name || "N/A"}</p>
                                    <p><strong>Email:</strong> {order.customer?.email || "N/A"}</p>
                                    <p><strong>Phone:</strong> {order.customer?.phone_number || "N/A"}</p>
                                  </div>
                                  <div style={{ marginTop: "24px" }}>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelOrder(order.id)}>
                                      Cancel & Delete Order
                                    </button>
                                  </div>
                                </div>

                                {/* Order Items Table */}
                                <div className="detail-block">
                                  <h4>Ordered Products Details</h4>
                                  <div className="order-items-grid" style={{ marginTop: "8px" }}>
                                    <div className="order-items-header">
                                      <span>Product Name</span>
                                      <span>Qty</span>
                                      <span>Price Paid</span>
                                      <span style={{ textAlign: "right" }}>Subtotal</span>
                                    </div>
                                    {order.items.map((item) => {
                                      const lineSubtotal = item.quantity * item.price_at_purchase;
                                      return (
                                        <div key={item.id} className="order-items-row">
                                          <span style={{ fontWeight: 500 }}>{item.product?.name || `Product ID: #${item.product_id} (Removed)`}</span>
                                          <span>x{item.quantity}</span>
                                          <span className="item-price-col">₹{item.price_at_purchase.toFixed(2)}</span>
                                          <span style={{ textAlign: "right", fontWeight: 600 }}>${lineSubtotal.toFixed(2)}</span>
                                        </div>
                                      );
                                    })}
                                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "8px", marginTop: "4px", fontWeight: 700, fontSize: "0.92rem" }}>
                                      <span>Receipt Grand Total</span>
                                      <span style={{ color: "var(--color-success)" }}>₹{order.total_amount.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "650px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="modal-title">Checkout New Order</h2>

            <form onSubmit={handleSubmit}>
              {/* Customer Selector */}
              <div className="form-group">
                <label className="form-label">Customer placing this order</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose registered customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div className="order-builder">
                <div className="builder-header">
                  <span className="builder-title">Shopping Cart Items Selection</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddRow}>
                    + Add Product Line
                  </button>
                </div>

                {orderItems.map((item, index) => {
                  const selectedProd = products.find(p => p.id === parseInt(item.product_id, 10));
                  const maxStock = selectedProd ? selectedProd.quantity : 9999;
                  const isLowStock = selectedProd && selectedProd.quantity < item.quantity;

                  return (
                    <div key={index} className="order-builder-row">
                      {/* Product Selector */}
                      <select
                        className="form-select"
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                        required
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.price.toFixed(2)} - Stock: {p.quantity})
                          </option>
                        ))}
                      </select>

                      {/* Quantity Input */}
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Qty"
                        min="1"
                        max={maxStock}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        required
                      />

                      {/* Remove Button */}
                      <button type="button" className="remove-builder-row" onClick={() => handleRemoveRow(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-12 12m0-12l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}

                {/* Total Preview */}
                <div className="builder-total-preview">
                  <span>Estimated Total (Excl. Tax & Shipping):</span>
                  <span className="builder-total-amount">
                    ₹{calculateLiveTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Place Order Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
