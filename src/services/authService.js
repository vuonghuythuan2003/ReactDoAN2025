import { BASE_URL_AUTH, getToken, setToken, removeToken, setRoles, removeRoles, setUserId, getUserId, removeUserId } from '../api/index';

export const login = async (username, password) => {
  try {
    const response = await BASE_URL_AUTH.post('/sign-in', { username, password });
    const { accessToken, roles, userId } = response.data;

    // Kiểm tra dữ liệu trả về từ API
    if (!accessToken || !roles || !userId) {
      throw new Error('Dữ liệu trả về từ API không hợp lệ: Thiếu accessToken, roles hoặc userId');
    }

    console.log('Dữ liệu trả về từ API /sign-in:', response.data); // Debug toàn bộ phản hồi
    console.log('userId:', userId); // Debug userId
    console.log('Roles:', roles); // Debug roles

    // Lưu token, roles và userId vào cookies
    setToken(accessToken);
    setRoles(roles.map((role) => role.roleName || role));
    setUserId(userId); // Lưu userId vào cookies
    console.log('Token sau khi đăng nhập:', getToken()); // Debug token
    console.log('userId sau khi đăng nhập:', getUserId()); // Debug userId

    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error.response?.data || error.message); // Debug lỗi
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await BASE_URL_AUTH.post('/sign-up', userData);
    console.log('Dữ liệu trả về từ API /sign-up:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error.response?.data || error.message); // Debug lỗi
    throw error;
  }
};

export const logout = async () => {
  const token = getToken();
  try {
    if (!token) {
      removeToken();
      removeRoles();
      removeUserId(); // Xóa userId khi không có token
      console.log('Đăng xuất thành công (không có token)');
      return { statusCode: 200, message: 'Đăng xuất thành công (không có token)' };
    }

    const response = await BASE_URL_AUTH.get('/logout');
    removeToken();
    removeRoles();
    removeUserId(); // Xóa userId khi đăng xuất
    console.log('Đăng xuất thành công, phản hồi từ server:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error.response?.data || error.message); // Debug lỗi
    removeToken();
    removeRoles();
    removeUserId(); // Xóa userId dù có lỗi
    throw error;
  }
};