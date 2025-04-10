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
            <p>Địa chỉ: Tân Uớc, Thanh Oai, Hà Nội</p>
            <p>Hotline: 0386675773</p>
            <p>Email: 21111062171@hunre.edu.vn</p>
          </Col>
          <Col md={4}>
            <h5>Chính sách</h5>
            <p>
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Chính sách bảo hành
              </a>
            </p>
            <p>
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Chính sách đổi trả
              </a>
            </p>
            <p>
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
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
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Giới thiệu
              </a>
            </p>
            <p>
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
                style={{ color: isAuthenticated ? '#007bff' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none' }}
              >
                Tin tức
              </a>
            </p>
            <p>
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, '#')}
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