import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear localStorage if not already on public update route
      if (!window.location.pathname.startsWith("/update/")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (name, email, password, role = "Student") =>
    api.post("/auth/register", { name, email, password, role }),
  login: (email, password, expectedRole = null) =>
    api.post("/auth/login", { email, password, expectedRole }),
  getMe: () => api.get("/auth/me"),
};

// Problem endpoints
export const problemApi = {
  submit: (formData) =>
    api.post("/problems", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyProblems: (params) => api.get("/problems/my", { params }),
  getMyStats: () => api.get("/problems/my/stats"),
  getMyProblemDetails: (id) => api.get(`/problems/my/${id}`),
  getStaffProblems: (params) => api.get("/problems/staff", { params }),
  getStaffStats: () => api.get("/problems/staff/stats"),
  getStaffProblemDetails: (id) => api.get(`/problems/staff/${id}`),
};

// Assignment endpoints
export const assignmentApi = {
  prepare: (payload) => api.post("/assignment/prepare", payload),
  confirm: (payload) => api.post("/assignment/confirm", payload),
};

// Public status update endpoints (no user token required)
export const publicUpdateApi = {
  getProblem: (problemId, token) =>
    axios.get(`${API_BASE_URL}/public/update/${problemId}/${token}`),
  startWork: (problemId, token) =>
    axios.post(`${API_BASE_URL}/public/update/${problemId}/${token}/start`),
  resolveProblem: (problemId, token, formData) =>
    axios.post(
      `${API_BASE_URL}/public/update/${problemId}/${token}/resolve`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),
};

export default api;
