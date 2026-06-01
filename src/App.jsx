import React, { useState, useEffect } from "react";
import { api } from "./services/api";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Customers from "./components/Customers";
import Orders from "./components/Orders";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Collections State
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Loading & Toasts
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Central Notification Helper
  const addToast = (title, message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Automatically dismiss toasts after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Primary Data Loader
  const loadAllData = async (showSilently = false) => {
    if (!showSilently) setLoading(true);
    try {
      const [prodsData, custsData, ordsData, statsData] = await Promise.all([
        api.products.getAll(),
        api.customers.getAll(),
        api.orders.getAll(),
        api.stats.getDashboard()
      ]);
      setProducts(prodsData);
      setCustomers(custsData);
      setOrders(ordsData);
      setStats(statsData);
    } catch (err) {
      addToast(
        "Connection Error", 
        err.message || "Failed to synchronise data with backend server.", 
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ==========================================
  // Product Operations
  // ==========================================
  const handleCreateProduct = async (data) => {
    try {
      const newProduct = await api.products.create(data);
      setProducts((prev) => [newProduct, ...prev]);
      addToast("Catalog Updated", `Product '${newProduct.name}' was successfully added.`, "success");
      loadAllData(true); // Quietly refresh stats and collections
    } catch (err) {
      addToast("Creation Failed", err.message, "error");
      throw err;
    }
  };

  const handleUpdateProduct = async (id, data) => {
    try {
      const updatedProduct = await api.products.update(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      addToast("Catalog Updated", `Product details for '${updatedProduct.name}' were updated.`, "success");
      loadAllData(true);
    } catch (err) {
      addToast("Update Failed", err.message, "error");
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast("Product Deleted", "The product was successfully removed from database.", "success");
      loadAllData(true);
    } catch (err) {
      addToast("Deletion Failed", err.message, "error");
    }
  };

  // ==========================================
  // Customer Operations
  // ==========================================
  const handleCreateCustomer = async (data) => {
    try {
      const newCustomer = await api.customers.create(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      addToast("Customer Registered", `Profile created for '${newCustomer.full_name}'.`, "success");
      loadAllData(true);
    } catch (err) {
      addToast("Registration Failed", err.message, "error");
      throw err;
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.customers.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      addToast("Customer Removed", "The customer profile was deleted.", "success");
      loadAllData(true);
    } catch (err) {
      addToast("Removal Failed", err.message, "error");
    }
  };

  // ==========================================
  // Order Operations
  // ==========================================
  const handleCreateOrder = async (data) => {
    try {
      const newOrder = await api.orders.create(data);
      
      // Inject details before fetch resolves to keep UI instant
      setOrders((prev) => [newOrder, ...prev]);
      addToast("Order Placed", `Invoice #${newOrder.id} has been created successfully.`, "success");
      
      // Explicitly reload all data to update stock indicators and stats
      await loadAllData(true);
    } catch (err) {
      addToast("Order Failed", err.message, "error");
      throw err;
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await api.orders.delete(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      addToast("Order Cancelled", `Order #${id} was deleted and stock was returned.`, "success");
      await loadAllData(true);
    } catch (err) {
      addToast("Cancellation Failed", err.message, "error");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">IO</div>
          <span className="brand-name">InvOrder Manager</span>
        </div>

        <nav>
          <ul className="nav-list">
            <li>
              <div
                className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Dashboard
              </div>
            </li>
            <li>
              <div
                className={`nav-item ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Products
              </div>
            </li>
            <li>
              <div
                className={`nav-item ${activeTab === "customers" ? "active" : ""}`}
                onClick={() => setActiveTab("customers")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Customers
              </div>
            </li>
            <li>
              <div
                className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Orders
              </div>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">DV</div>
          <div className="user-info">
            <span className="user-name">Divyanshu Verma</span>
            <span className="user-role">Software Engineer</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {loading && products.length === 0 ? (
          <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center", minHeight: "300px", color: "var(--text-secondary)" }}>
            <div>
              <h3>Establishing database handshakes...</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px", textAlign: "center" }}>Initializing microservices...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <Dashboard stats={stats} loading={loading} onNavigate={setActiveTab} />
            )}
            
            {activeTab === "products" && (
              <Products
                products={products}
                loading={loading}
                onCreate={handleCreateProduct}
                onUpdate={handleUpdateProduct}
                onDelete={handleDeleteProduct}
                addToast={addToast}
              />
            )}
            
            {activeTab === "customers" && (
              <Customers
                customers={customers}
                loading={loading}
                onCreate={handleCreateCustomer}
                onDelete={handleDeleteCustomer}
                addToast={addToast}
              />
            )}
            
            {activeTab === "orders" && (
              <Orders
                orders={orders}
                products={products}
                customers={customers}
                loading={loading}
                onCreate={handleCreateOrder}
                onDelete={handleDeleteOrder}
                addToast={addToast}
              />
            )}
          </>
        )}
      </main>

      {/* Elegant Floating Toast Alerts System */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "14px", height: "14px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
