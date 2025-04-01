import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/Footer.scss'; // Import SCSS mới

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Thông tin liên hệ</h5>
            <p>Địa chỉ: 123 Đường Đồng Hồ, TP. Hồ Chí Minh</p>
            <p>Hotline: 0123 456 789</p>
            <p>Email: support@xwatch.vn</p>
          </Col>
          <Col md={4}>
            <h5>Chính sách</h5>
            <p>
              <a href="#">Chính sách bảo hành</a>
            </p>
            <p>
              <a href="#">Chính sách đổi trả</a>
            </p>
            <p>
              <a href="#">Chính sách giao hàng</a>
            </p>
          </Col>
          <Col md={4}>
            <h5>Liên kết nhanh</h5>
            <p>
              <a href="#">Giới thiệu</a>
            </p>
            <p>
              <a href="#">Tin tức</a>
            </p>
            <p>
              <a href="#">Liên hệ</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;