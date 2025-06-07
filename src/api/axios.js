import axios from "axios";

// const API_BASE_URL = "http://localhost:8000/api/v1"; // Ensure this is correct

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Ensures  (JWT) are sent with requests
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token from session before every request
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle expired tokens (401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized - Token expired or invalid");
            sessionStorage.removeItem("token"); // Clear expired token
            window.location.href = "/"; // Redirect to login
        }
        return Promise.reject(error);
    }
);

export default apiClient;
