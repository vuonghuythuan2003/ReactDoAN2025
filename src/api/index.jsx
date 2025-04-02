import axios from "axios";
import Cookies from "js-cookie";

// Cấu hình Axios cho các API chung
export const BASE_URL = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Cấu hình Axios cho API admin
export const BASE_URL_ADMIN = axios.create({
  baseURL: "http://localhost:8080/api/v1/admin",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Cấu hình Axios cho API auth
export const BASE_URL_AUTH = axios.create({
  baseURL: "http://localhost:8080/api/v1/auth",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Thêm interceptor để tự động thêm token vào header cho BASE_URL_ADMIN
BASE_URL_ADMIN.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để tự động thêm token vào header cho BASE_URL_AUTH
BASE_URL_AUTH.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàm lấy token từ cookies
export const getToken = () => Cookies.get("token");

// Hàm đặt token vào cookies
export const setToken = (token) => Cookies.set("token", token, { expires: 7 });

// Hàm xóa token khỏi cookies
export const removeToken = () => Cookies.remove("token");

// Hàm lấy roles từ cookies
export const getRoles = () => {
  const roles = Cookies.get("roles");
  return roles ? JSON.parse(roles) : [];
};

// Hàm đặt roles vào cookies
export const setRoles = (roles) => Cookies.set("roles", JSON.stringify(roles), { expires: 7 });

// Hàm xóa roles khỏi cookies
export const removeRoles = () => Cookies.remove("roles");