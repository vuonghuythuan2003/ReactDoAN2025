import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { FaShoppingCart } from 'react-icons/fa';
import '../styles/Header.scss';

const Header = () => {
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
              <span>0986848485</span>
            </div>
            <div className="cart">
              <FaShoppingCart className="icon" />
              <span className="cart-count">0</span>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;