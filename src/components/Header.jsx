import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from '../services/authService'; // Import logout từ authService.js
import '../styles/Header.scss';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Gọi hàm logout từ authService
      toast.success('Đăng xuất thành công!', { position: 'top-right', autoClose: 3000 });
      navigate('/login'); // Chuyển hướng về trang đăng nhập
    } catch (error) {
      toast.error('Đăng xuất thất bại!', { position: 'top-right', autoClose: 3000 });
    }
  };

  return (
    <Navbar expand="lg" className="header">
      <Container>
        <Navbar.Brand href="/" className="logo">
          <span className="logo-x">X</span>WATCH
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto nav-links">
            <Nav.Link href="#">Về Xwatch</Nav.Link>
            <Nav.Link href="#">Thương hiệu</Nav.Link>
            <Nav.Link href="#">Đồng hồ nam</Nav.Link>
            <Nav.Link href="#">Đồng hồ nữ</Nav.Link>
            <Nav.Link href="#">Cặp đôi</Nav.Link>
            <Nav.Link href="#">Sửa chữa</Nav.Link>
            <Nav.Link href="#">Kiến thức</Nav.Link>
            <Nav.Link href="#">Phụ kiện</Nav.Link>
          </Nav>

          <div className="navbar-icons">
            <div className="hotline">
              <FiPhone className="icon" />
              <span>0386675773</span>
            </div>
            <div className="cart">
              <FaShoppingCart className="icon" />
              <span className="cart-count">0</span>
            </div>
            <div className="user">
              <FaUser className="icon" onClick={handleLogout} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;