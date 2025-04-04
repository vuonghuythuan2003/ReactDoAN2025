import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
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

function App() {
  return (
    <Provider store={store}>
      <Routes>
        {/* Public routes with DefaultLayout */}
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
          <Route path="categories/:categoryId" element={<CategoryProductsPage /> }/>
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
            path="cart" // Thêm route cho CartPage
            element={
              <PrivateRoute requiredRole="USER">
                <CartPage />
              </PrivateRoute>
            }
          />
          {/* Placeholder routes for other links in HeaderUser */}
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