// Centralized API Service for TechCart
import { products as fallbackProducts } from "../data/products";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper for standard HTTP requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ==================================================
// PRODUCTS API
// ==================================================

export async function fetchProducts(category, search) {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await request(`/products${queryString}`);
    return res.data;
  } catch (error) {
    console.warn("Backend API unavailable, falling back to local products data:", error.message);
    // Graceful offline fallback
    let list = [...fallbackProducts];
    if (category && category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (search) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }
}

export async function fetchProductById(id) {
  try {
    const res = await request(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.warn("Backend API unavailable, falling back to local product data:", error.message);
    const found = fallbackProducts.find((p) => p.id === parseInt(id, 10));
    if (!found) throw new Error("Product not found");
    return found;
  }
}

// ==================================================
// AUTHENTICATION API
// ==================================================

export async function apiRegister(name, email, password) {
  return await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin(email, password) {
  return await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetProfile(token) {
  return await request("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==================================================
// ORDERS API
// ==================================================

export async function apiCreateOrder(orderData, token) {
  return await request("/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
}

export async function apiGetUserOrders(token) {
  const res = await request("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
