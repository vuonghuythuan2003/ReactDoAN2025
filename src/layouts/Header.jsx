// Header.jsx
import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <Navbar expand="lg" style={{ backgroundColor: '#343a40', padding: '10px' }}>
      <Container>
        <Navbar.Brand as={NavLink} to="/" style={{ color: '#fff', fontWeight: 'bold' }}>
          React-Bootstrap
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/" className="nav-link" style={{ color: '#fff' }}>Home</NavLink>
            <NavLink to="/product" className="nav-link" style={{ color: '#fff' }}>Product</NavLink>
            <NavLink to="/register" className="nav-link" style={{ color: '#fff' }}>Register</NavLink>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown" menuVariant="dark">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
