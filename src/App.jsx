import React from 'react';
import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DefaultLayout from './layouts/DefaultLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Register from './pages/Register';
import Category from './pages/admin/category/Category';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Product from './pages/admin/product/Product';
import Oders from './pages/admin/oders/Oders';
import User from './pages/admin/manageruser/User';
import Dashboard from './pages/admin/dashboard/Dashboard';
import AdminComments from './pages/admin/product/AdminComments';
import Brand from './pages/admin/brand/Brand';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
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
    </>
  );
}

export default App;