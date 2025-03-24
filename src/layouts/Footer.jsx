// Footer.jsx
import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';
function Footer() {
  return (
        <div style={{ backgroundColor: '#1a1a1a', 
            color: '#fff', 
            padding: '40px 0',
             }}>
            <Container>
                <Row>
                    <Col lg={4}>
                        <h5>Dịch vụ khách hàng</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>Chính sách khách hàng thân thiết</li>
                            <li>Chính sách đổi trả, bảo hành</li>
                            <li>Chính sách bảo mật</li>
                            <li>Chính sách thanh toán, giao nhận</li>
                            <li>Chính sách đồng phục</li>
                            <li>Hướng dẫn chọn size</li>
                        </ul>
                    </Col>
                    <Col md={4}>
                        <h5>Về chúng tôi</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>Giới thiệu</li>
                            <li>Tuyển dụng</li>
                            <li>Hệ thống cửa hàng</li>
                            <li>Tin tức</li>
                            <li>Liên hệ</li>
                        </ul>
                    </Col>
                    <Col lg={4}>
                        <h5>Liên hệ</h5>
                        <p><FaMapMarkerAlt /> Địa chỉ: Đường An Định, Phường Việt Hòa, TP. Hải Dương</p>
                        <p><FaPhoneAlt /> Hotline: 024 999 86 999</p>
                        <p><FaEnvelope /> Email: example@yody.vn</p>
                        <div>
                            <FaFacebookF style={{ margin: '0 10px', cursor: 'pointer' }} />
                            <FaInstagram style={{ margin: '0 10px', cursor: 'pointer' }} />
                            <FaYoutube style={{ margin: '0 10px', cursor: 'pointer' }} />
                        </div>
                    </Col>
                </Row>
                <hr style={{ borderColor: '#555' }} />
                <p style={{ textAlign: 'center', marginTop: '20px' }}>© 2025 Công ty thời trang Yody - Mã số doanh nghiệp: 0801206940</p>
            </Container>
        </div>
    );
}

export default Footer;
