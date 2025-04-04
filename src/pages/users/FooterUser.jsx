import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux'; // Thêm useSelector
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { toast } from 'react-toastify'; // Thêm toast
import '../../styles/Footer.scss';

const FooterUser = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth); // Lấy trạng thái đăng nhập từ Redux

  const handleLinkClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Ngăn hành động mặc định của liên kết
      toast.warning('Vui lòng đăng nhập để truy cập!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
    }
    console.log(path);
    // Nếu đã đăng nhập, cho phép nhấp vào liên kết bình thường
  };

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
              <a
                href="/policy/warranty"
                onClick={(e) => handleLinkClick(e, '/policy/warranty')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Chính sách bảo hành
              </a>
            </p>
            <p>
              <a
                href="/policy/return"
                onClick={(e) => handleLinkClick(e, '/policy/return')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Chính sách đổi trả
              </a>
            </p>
            <p>
              <a
                href="/policy/delivery"
                onClick={(e) => handleLinkClick(e, '/policy/delivery')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Chính sách giao hàng
              </a>
            </p>
          </Col>
          <Col md={4}>
            <h5>Liên kết nhanh</h5>
            <p>
              <a
                href="/about"
                onClick={(e) => handleLinkClick(e, '/about')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Giới thiệu
              </a>
            </p>
            <p>
              <a
                href="/news"
                onClick={(e) => handleLinkClick(e, '/news')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Tin tức
              </a>
            </p>
            <p>
              <a
                href="/contact"
                onClick={(e) => handleLinkClick(e, '/contact')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Liên hệ
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default FooterUser;