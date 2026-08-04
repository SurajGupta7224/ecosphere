const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const customerFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('customer_token');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : {'Content-Type': 'application/json'}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${VITE_API_URL}${endpoint}`, {
    ...options,
    headers
  });

  let data = {};
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};
