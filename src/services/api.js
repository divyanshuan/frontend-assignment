// API base path - defaults to localhost:8000 for development, or fits relative proxy paths in Nginx
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Custom error class to pass HTTP status and API details
 */
class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Unified request handler with auto JSON serialization and explicit error catching
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  const config = {
    ...options,
    headers,
  };
  
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Check if empty response (like 204 or delete message)
    const contentType = response.headers.get("content-type");
    let data = null;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }
    
    if (!response.ok) {
      // Extract FastAPI validation or business rule exception details
      const errorMessage = data?.detail || response.statusText || "Request failed";
      throw new ApiError(response.status, errorMessage, data?.detail);
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or server offline errors
    throw new Error(error.message || "Unable to connect to the backend server. Please make sure the service is running.");
  }
}

export const api = {
  // Products Management
  products: {
    getAll: () => request("/products"),
    get: (id) => request(`/products/${id}`),
    create: (data) => request("/products", { method: "POST", body: data }),
    update: (id, data) => request(`/products/${id}`, { method: "PUT", body: data }),
    delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
  },
  
  // Customers Management
  customers: {
    getAll: () => request("/customers"),
    get: (id) => request(`/customers/${id}`),
    create: (data) => request("/customers", { method: "POST", body: data }),
    delete: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  },
  
  // Orders Management
  orders: {
    getAll: () => request("/orders"),
    get: (id) => request(`/orders/${id}`),
    create: (data) => request("/orders", { method: "POST", body: data }),
    delete: (id) => request(`/orders/${id}`, { method: "DELETE" }),
  },
  
  // Dashboard Metrics
  stats: {
    getDashboard: () => request("/dashboard/stats"),
  }
};
