import DefaultLayout from './layouts/DefaultLayout';
import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify'; // Thêm import
import 'react-toastify/dist/ReactToastify.css'; // Thêm import
import Home from './pages/Home';
import Register from './pages/Register';
import Detail from './pages/Detail';
import Category from './pages/admin/category/Category';
import AddCategory from './pages/admin/category/AddCategory';
import EditCategory from './pages/admin/category/EditCategory';
import AdminLayout from './layouts/AdminLayout';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Product from './pages/admin/product/Product';
import AddProduct from './pages/admin/product/AddProduct';
import EditProduct from './pages/admin/product/EditProduct';
import Oders from './pages/admin/oders/Oders';
import User from './pages/admin/manageruser/User';
import Dashboard from './pages/admin/dashboard/Dashboard';
import AdminComments from './pages/admin/product/AdminComments';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<Product />} />
          <Route path="product-detail/:id" element={<Detail />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="category" element={<Category />} />
          <Route path="add/category" element={<AddCategory />} />
          <Route path="edit/category/:id" element={<EditCategory />} />
          <Route path="product" element={<Product />} />
          <Route path="add/product" element={<AddProduct />} />
          <Route path="edit/product/:id" element={<EditProduct />} />
          <Route path="comment/admin" element={<AdminComments />} />
          <Route path="order" element={<Oders />} />
          <Route path="user" element={<User />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
}

export default App;