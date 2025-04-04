import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BASE_URL } from '../api/index';
import '../styles/CategoryProductsPage.scss';
import Banner from './Banner';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const blogPosts = [
    {
      id: 1,
      title: "Chính sách bảo hành đồng hồ 5 năm cả lỗi người dùng",
      date: "30/11/-0001",
      image: "/image/blogdonghonam4.jpg", // Sửa đường dẫn
      description: "Vui lòng mượn đem đến cho Quý khách hàng sự AN TÂM tuyệt đối khi mua đồng hồ, đội ngũ XWatch đã xây...",
    },
    {
      id: 2,
      title: "8/3: Mua đồng hồ nữ - Tặng món quà thanh xuân!",
      date: "01/01/1970",
      image: "/image/donghonu1.png", // Sửa đường dẫn
      description: "8/3 này, đừng chỉ chúc em 'chậm on' em ơi, hãy dành tặng cho nàng Món quà thanh xuân - Trị từ ý tưởng...",
    },
    {
      id: 3,
      title: "Thông báo: XWatch Hà Đông chuyển địa điểm mới!",
      date: "03/02/2025",
      image: "/image/blogdonghonam2.png", // Sửa đường dẫn
      description: "Nhằm mang đến một không gian khách hàng trang, hiện đại hơn giúp anh em có những trải nghiệm tuyệt vời...",
    },
    {
      id: 4,
      title: "XWatch thông báo lịch nghỉ Tết At Tý 2025!",
      date: "30/11/-0001",
      image: "/image/blogdonghonam2.jpg", // Sửa đường dẫn
      description: "Nhân dịp Tết Nguyên Đán At Tý 2025, XWatch trân trọng thông báo đến Quý khách hàng lịch nghỉ Tết của...",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await BASE_URL.get(`/products/categories/${categoryId}`);
        setProducts(response.data.content);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
        setLoading(false);
        console.error('Lỗi khi lấy sản phẩm:', err.response?.data || err.message);
      }
    };

    fetchProducts();
  }, [categoryId]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="category-products-page">
      {/* Banner quảng cáo */}
      <Banner />

      <h1>
        {categoryId === '1' ? 'Đồng hồ nam' : categoryId === '2' ? 'Đồng hồ nữ' : 'Cặp đôi'}
      </h1>
      <Row>
        {products.map((product) => (
          <Col md={4} key={product.productId} className="mb-4">
            <Card className="product-card">
              <Card.Img variant="top" src={product.image} alt={product.productName} />
              <Card.Body>
                <Card.Title>{product.productName}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text>Giá: {product.unitPrice.toLocaleString('vi-VN')} VNĐ</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Phần bài viết (blog posts) */}
      <div className="blog-section mt-5">
        <h2>Kiến thức đồng hồ</h2>
        <Row>
          {blogPosts.map((post) => (
            <Col md={3} key={post.id} className="mb-4">
              <Card className="blog-card">
                <Card.Img variant="top" src={post.image} alt={post.title} />
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{post.date}</Card.Subtitle>
                  <Card.Text>{post.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default CategoryProductsPage;