import axios from "axios";
import Cookies from "js-cookie";

const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export const BASE_URL = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const BASE_URL_ADMIN = axios.create({
  baseURL: "http://localhost:8080/api/v1/admin",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const BASE_URL_AUTH = axios.create({
  baseURL: "http://localhost:8080/api/v1/auth",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const BASE_URL_USER = axios.create({
  baseURL: "http://localhost:8080/api/v1/user",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

addTokenInterceptor(BASE_URL_ADMIN);
addTokenInterceptor(BASE_URL_AUTH);
addTokenInterceptor(BASE_URL_USER);

// Hàm quản lý token
export const getToken = () => Cookies.get("token");
export const setToken = (token) => Cookies.set("token", token, { expires: 7 });
export const removeToken = () => Cookies.remove("token");

// Hàm quản lý roles
export const getRoles = () => {
  const roles = Cookies.get("roles");
  return roles ? JSON.parse(roles) : [];
};
export const setRoles = (roles) => Cookies.set("roles", JSON.stringify(roles), { expires: 7 });
export const removeRoles = () => Cookies.remove("roles");

// Hàm quản lý userId
export const getUserId = () => Cookies.get("userId"); // Lấy userId từ cookies
export const setUserId = (userId) => Cookies.set("userId", userId, { expires: 7 }); // Lưu userId vào cookies
export const removeUserId = () => Cookies.remove("userId"); // Xóa userId khỏi cookies