import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store/index.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
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
import axios from 'axios'; // Thêm axios để gọi API

// Component CheckoutSuccess
const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('paymentId');
        const payerId = searchParams.get('PayerID');
        const userId = searchParams.get('userId');
        const receiveAddress = searchParams.get('receiveAddress');
        const receiveName = searchParams.get('receiveName');
        const receivePhone = searchParams.get('receivePhone');
        const note = searchParams.get('note');

        if (!paymentId || !payerId || !userId) {
            toast.error('Thông tin thanh toán không hợp lệ!', { position: 'top-right', autoClose: 3000 });
            navigate('/user/cart');
            return;
        }

        // Gọi API để kiểm tra trạng thái thanh toán
        axios.get(`http://localhost:8080/api/v1/user/cart/checkout/success`, {
            params: {
                paymentId,
                PayerID: payerId,
                userId,
                receiveAddress,
                receiveName,
                receivePhone,
                note
            }
        })
            .then((response) => {
                if (response.data.message.includes('Thanh toán thành công')) {
                    toast.success('Thanh toán thành công!', { position: 'top-right', autoClose: 3000 });
                    setTimeout(() => {
                        navigate('/user');
                    }, 3000);
                } else {
                    throw new Error(response.data.message || 'Thanh toán không được phê duyệt!');
                }
            })
            .catch((error) => {
                toast.error(error.message || 'Xác nhận thanh toán thất bại!', { position: 'top-right', autoClose: 3000 });
                console.error('Lỗi khi xác nhận thanh toán:', error);
                navigate('/user/cart');
            });
    }, [navigate, dispatch]);

    const handleReturnToHome = (e) => {
        e.preventDefault();
        if (!isAuthenticated || !user?.userId) {
            toast.warning('Vui lòng đăng nhập để thực hiện thao tác này!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
            return;
        }
        navigate('/user');
    };

    return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h2>Đang xử lý thanh toán...</h2>
            <p>Vui lòng chờ trong giây lát. Bạn sẽ được chuyển hướng về trang chủ nếu thanh toán thành công.</p>
            <a href="/user" onClick={handleReturnToHome}>Quay về trang chủ ngay</a>
        </div>
    );
};

// Component CheckoutCancel
const CheckoutCancel = () => {
    const navigate = useNavigate();

    useEffect(() => {
        toast.info('Thanh toán đã bị hủy!', { position: 'top-right', autoClose: 3000 });
    }, []);

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
                <Route path="/" element={<DefaultLayout />}>
                    <Route index element={<Home />} />
                    <Route path="categories/:categoryId" element={<CategoryProductsPage />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

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
                    <Route
                        path="history"
                        element={
                            <PrivateRoute requiredRole="USER">
                                <UserHistory />
                            </PrivateRoute>
                        }
                    />
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