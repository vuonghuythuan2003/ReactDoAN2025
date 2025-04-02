import { BASE_URL_AUTH, getToken, setToken, removeToken, setRoles, removeRoles } from '../api/index';

export const login = async (username, password) => {
  try {
    const response = await BASE_URL_AUTH.post('/sign-in', { username, password });
    const { accessToken, roles } = response.data;

    // Kiểm tra dữ liệu trả về từ API
    if (!accessToken || !roles) {
      throw new Error('Dữ liệu trả về từ API không hợp lệ: Thiếu accessToken hoặc roles');
    }

    console.log('Dữ liệu trả về từ API /sign-in:', response.data); // Debug
    console.log('Roles:', roles); // Debug

    // Lưu token và roles vào cookies
    setToken(accessToken);
    setRoles(roles.map((role) => role.roleName || role));
    console.log('Token sau khi đăng nhập:', getToken()); // Debug

    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error.response?.data || error.message); // Debug
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await BASE_URL_AUTH.post('/sign-up', userData);
    console.log('Dữ liệu trả về từ API /sign-up:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error.response?.data || error.message); // Debug
    throw error;
  }
};

export const logout = async () => {
  const token = getToken();
  try {
    // Nếu không có token, không cần gửi yêu cầu đến backend
    if (!token) {
      removeToken();
      removeRoles();
      return { statusCode: 200, message: 'Đăng xuất thành công (không có token)' };
    }

    // Gửi yêu cầu đăng xuất (interceptor sẽ tự động thêm header Authorization)
    const response = await BASE_URL_AUTH.get('/logout');
    removeToken();
    removeRoles();
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error.response?.data || error.message); // Debug
    // Dù có lỗi, vẫn xóa token và roles phía client
    removeToken();
    removeRoles();
    throw error;
  }
};