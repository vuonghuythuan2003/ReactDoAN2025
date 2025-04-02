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
import HomeUser from '../src/pages/users/HomeUser.jsx'; 
import Category from './pages/admin/category/Category.jsx';
import DashboardAdmin from './pages/admin/DashboardAdmin.jsx';
import Product from './pages/admin/product/Product.jsx';
import Oders from './pages/admin/oders/Oders.jsx';
import User from './pages/admin/manageruser/User.jsx';
import Dashboard from './pages/admin/dashboard/Dashboard.jsx';
import AdminComments from './pages/admin/product/AdminComments.jsx';
import Brand from './pages/admin/brand/Brand.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user"
          element={
            <PrivateRoute requiredRole="USER">
              <HomeUser />
            </PrivateRoute>
          }
        />
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