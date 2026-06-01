import React from "react";

export default function Dashboard({ stats, loading, onNavigate }) {
  if (loading || !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px", color: "var(--text-secondary)" }}>
        <p>Loading analytical insights...</p>
      </div>
    );
  }

  const { total_products, total_customers, total_orders, low_stock_products } = stats;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Metrics Cards Grid */}
      <div className="dashboard-grid">
        {/* Products Card */}
        <div className="card metric-card" style={{ "--card-accent": "var(--color-primary)", "--icon-bg": "rgba(59, 130, 246, 0.1)" }}>
          <div className="metric-card-header">
            <span className="metric-title">Total Products</span>
            <div className="metric-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{total_products}</div>
          <div className="metric-desc">Registered catalogue items</div>
        </div>

        {/* Customers Card */}
        <div className="card metric-card" style={{ "--card-accent": "var(--color-success)", "--icon-bg": "rgba(16, 185, 129, 0.1)" }}>
          <div className="metric-card-header">
            <span className="metric-title">Total Customers</span>
            <div className="metric-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{total_customers}</div>
          <div className="metric-desc">Active client accounts</div>
        </div>

        {/* Orders Card */}
        <div className="card metric-card" style={{ "--card-accent": "var(--color-warning)", "--icon-bg": "rgba(245, 158, 11, 0.1)" }}>
          <div className="metric-card-header">
            <span className="metric-title">Total Orders</span>
            <div className="metric-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{total_orders}</div>
          <div className="metric-desc">Completed checkouts</div>
        </div>

        {/* Low Stock Alerts Count Card */}
        <div className="card metric-card" style={{ "--card-accent": "var(--color-danger)", "--icon-bg": "rgba(239, 68, 68, 0.1)" }}>
          <div className="metric-card-header">
            <span className="metric-title">Low Stock Items</span>
            <div className="metric-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="metric-value" style={{ color: low_stock_products.length > 0 ? "var(--color-danger)" : "var(--text-primary)" }}>
            {low_stock_products.length}
          </div>
          <div className="metric-desc">Items with stock under 5 units</div>
        </div>
      </div>

      {/* Critical Stock Panel */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Critical Inventory Alerts</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              These products need immediate replenishment.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("products")}>
            Restock Catalogue
          </button>
        </div>

        {low_stock_products.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px", backgroundColor: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "var(--border-radius-md)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="var(--color-success)" style={{ width: "22px", height: "22px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: "0.9rem", color: "var(--color-success)", fontWeight: "500" }}>
              All products are sufficiently stocked. Healthy inventory level maintained!
            </span>
          </div>
        ) : (
          <div className="low-stock-panel">
            {low_stock_products.map((product) => (
              <div key={product.id} className="low-stock-item">
                <div className="low-stock-info">
                  <span className="low-stock-name">{product.name}</span>
                  <span className="low-stock-sku">SKU: {product.sku}</span>
                </div>
                <div className="low-stock-count">
                  <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                    Price: <span style={{ color: "var(--color-success)" }}>₹{product.price.toFixed(2)}</span>
                  </span>
                  <span className="badge badge-danger">
                    Only {product.quantity} Left
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
