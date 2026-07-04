const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Encapsulates the logic for making HTTP requests using the native fetch API.
 * @param {string} endpoint - The API endpoint to call.
 * @param {RequestInit} options - The options for the fetch request.
 * @returns {Promise<any>} - A promise that resolves to the JSON response.
 * @throws {Error} - Throws an error if the network response is not ok.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      // Try to parse the error body for a more descriptive message
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    // Handle cases with no content
    if (response.status === 204) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error; // Re-throw the error to be caught by the caller
  }
}

export const api = {
  get(endpoint, options) {
    return request(endpoint, { ...options, method: 'GET' });
  },
  post(endpoint, body, options) {
    return request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  },
  patch(endpoint, body, options) {
    return request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  },
  put(endpoint, body, options) {
    return request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },
  delete(endpoint, options) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },
};
