import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BASE_URL_USER } from '../api/index';
import '../styles/BrandsPage.scss';
import HeaderUser from '../pages/users/HeaderUser';
import FooterUser from '../pages/users/FooterUser';

const BrandsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBrands = async () => {
      try {
        const response = await BASE_URL_USER.get('/brands');
        setBrands(response.data.content);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách thương hiệu.');
        setLoading(false);
        console.error('Lỗi khi lấy danh sách thương hiệu:', err.response?.data || err.message);
      }
    };

    fetchBrands();
  }, [isAuthenticated, navigate]);

  const handleBrandClick = (brandId) => {
    navigate(`/user/brands/${brandId}`); // Đúng với route /brands/:brandId
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <HeaderUser />
      <Container className="brands-page">
        <h1 className="text-center mb-4">Danh sách thương hiệu</h1>
        <Row>
          {brands.map((brand) => (
            <Col md={4} key={brand.brandId} className="mb-4">
              <Card
                onClick={() => handleBrandClick(brand.brandId)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Img variant="top" src={brand.image} alt={brand.brandName} />
                <Card.Body>
                  <Card.Title>{brand.brandName}</Card.Title>
                  <Card.Text>{brand.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <FooterUser />
    </div>
  );
};

export default BrandsPage;