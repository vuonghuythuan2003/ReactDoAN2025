import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux'; // Thêm useDispatch, useSelector
import { store } from './redux/store/index.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DefaultLayout from './layouts/DefaultLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import HomeUser from './pages/users/HomeUser.jsx';
import Category from './pages/admin/category/Category.jsx';
import Product from './pages/admin/product/Product.jsx';
import Oders from './pages/admin/oders/Oders.jsx';
import User from './pages/admin/manageruser/User.jsx';
import Dashboard from './pages/admin/dashboard/Dashboard.jsx';
import AdminComments from './pages/admin/product/AdminComments.jsx';
import Brand from './pages/admin/brand/Brand.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import CategoryProductsPage from './components/CategoryProductsPage.jsx';
import BrandsPage from './components/BrandsPage.jsx';
import BrandProductsPage from './components/BrandProductsPage.jsx';
import CategoryProductsPageUser from './components/CategoryProductsPageUser.jsx';
import CartPage from './pages/users/CartPage.jsx';
import UserHistory from './components/UserHistory.jsx';
import { clearCart } from './redux/reducers/CartSlice'; // Import action clearCart
import { toast } from 'react-toastify';

// Component CheckoutSuccess
const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Tự động điều hướng đến /user sau 3 giây
    const timer = setTimeout(() => {
      navigate('/user');
    }, 3000);

    // Dọn dẹp timer khi component unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleReturnToHome = (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
    if (!isAuthenticated || !user?.userId) {
      toast.warning('Vui lòng đăng nhập để thực hiện thao tác này!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }

    // Dispatch action clearCart để reset giỏ hàng
    dispatch(clearCart(user.userId))
      .unwrap()
      .then(() => {
        toast.success('Giỏ hàng đã được xóa sau khi thanh toán!', { position: 'top-right', autoClose: 3000 });
        navigate('/user'); // Điều hướng về trang chủ
      })
      .catch((error) => {
        toast.error('Xóa giỏ hàng thất bại!', { position: 'top-right', autoClose: 3000 });
        console.error('Lỗi khi xóa giỏ hàng:', error);
      });
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Thanh toán thành công!</h2>
      <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
      <p>Bạn sẽ được chuyển hướng về trang chủ trong 3 giây...</p>
      <a href="/user" onClick={handleReturnToHome}>Quay về trang chủ ngay</a>
    </div>
  );
};

// Component CheckoutCancel
const CheckoutCancel = () => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2>Thanh toán đã bị hủy</h2>
      <p>Bạn đã hủy thanh toán. Vui lòng thử lại nếu muốn tiếp tục.</p>
      <a href="/user/cart">Quay lại giỏ hàng</a>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Routes>
        {/* Public routes with DefaultLayout */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
          <Route path="categories/:categoryId" element={<CategoryProductsPage />} />
        </Route>

        {/* Public routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes for USER */}
        <Route path="/user">
          <Route
            index
            element={
              <PrivateRoute requiredRole="USER">
                <HomeUser />
              </PrivateRoute>
            }
          />
          <Route
            path="brands"
            element={
              <PrivateRoute requiredRole="USER">
                <BrandsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="brands/:brandId"
            element={
              <PrivateRoute requiredRole="USER">
                <BrandProductsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="categories/:categoryId"
            element={
              <PrivateRoute requiredRole="USER">
                <CategoryProductsPageUser />
              </PrivateRoute>
            }
          />
          <Route
            path="cart"
            element={
              <PrivateRoute requiredRole="USER">
                <CartPage />
              </PrivateRoute>
            }
          />
          {/* Route cho checkout success và cancel */}
          <Route
            path="cart/checkout/success"
            element={
              <PrivateRoute requiredRole="USER">
                <CheckoutSuccess />
              </PrivateRoute>
            }
          />
          <Route
            path="cart/checkout/cancel"
            element={
              <PrivateRoute requiredRole="USER">
                <CheckoutCancel />
              </PrivateRoute>
            }
          />
          {/* Route cho UserHistory */}
          <Route
            path="history"
            element={
              <PrivateRoute requiredRole="USER">
                <UserHistory />
              </PrivateRoute>
            }
          />
          {/* Placeholder routes */}
          <Route
            path="repair"
            element={
              <PrivateRoute requiredRole="USER">
                <div>Repair Page (Placeholder)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="knowledge"
            element={
              <PrivateRoute requiredRole="USER">
                <div>Knowledge Page (Placeholder)</div>
              </PrivateRoute>
            }
          />
          <Route
            path="accessories"
            element={
              <PrivateRoute requiredRole="USER">
                <div>Accessories Page (Placeholder)</div>
              </PrivateRoute>
            }
          />
        </Route>

        {/* Protected routes for ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="category" element={<Category />} />
          <Route path="product" element={<Product />} />
          <Route path="comment/admin" element={<AdminComments />} />
          <Route path="order" element={<Oders />} />
          <Route path="user" element={<User />} />
          <Route path="brand" element={<Brand />} />
        </Route>

        {/* Fallback route for 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover={false}
        draggable
      />
    </Provider>
  );
}

export default App;