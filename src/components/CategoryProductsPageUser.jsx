import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BASE_URL } from '../api/index';
import Banner from './Banner';
import HeaderUser from '../pages/users/HeaderUser';
import FooterUser from '../pages/users/FooterUser';
import ProductModal from '../components/ProductModal';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/reducers/CartSlice'; // Import addToCart từ Redux
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CategoryProductsPageUser.scss';

const CategoryProductsPageUser = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const blogPosts = [
    {
      id: 1,
      title: "Chính sách bảo hành đồng hồ 5 năm cả lỗi người dùng",
      date: "30/11/-0001",
      image: "/image/blogdonghonam4.jpg",
      description: "Vui lòng mượn đem đến cho Quý khách hàng sự AN TÂM tuyệt đối khi mua đồng hồ, đội ngũ XWatch đã xây...",
    },
    {
      id: 2,
      title: "8/3: Mua đồng hồ nữ - Tặng món quà thanh xuân!",
      date: "01/01/1970",
      image: "/image/donghonu1.png",
      description: "8/3 này, đừng chỉ chúc em 'chậm on' em ơi, hãy dành tặng cho nàng Món quà thanh xuân - Trị từ ý tưởng...",
    },
    {
      id: 3,
      title: "Thông báo: XWatch Hà Đông chuyển địa điểm mới!",
      date: "03/02/2025",
      image: "/image/blogdonghonam2.png",
      description: "Nhằm mang đến một không gian khách hàng trang, hiện đại hơn giúp anh em có những trải nghiệm tuyệt vời...",
    },
    {
      id: 4,
      title: "XWatch thông báo lịch nghỉ Tết At Tý 2025!",
      date: "30/11/-0001",
      image: "/image/blogdonghonam2.jpg",
      description: "Nhân dịp Tết Nguyên Đán At Tý 2025, XWatch trân trọng thông báo đến Quý khách hàng lịch nghỉ Tết của...",
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const response = await BASE_URL.get(`/products/categories/${categoryId}`);
        setProducts(response.data.content || response.data);
        setLoadingProducts(false);
      } catch (err) {
        setErrorProducts('Không thể tải danh sách sản phẩm.');
        setLoadingProducts(false);
        console.error('Lỗi khi lấy sản phẩm:', err.response?.data || err.message);
      }
    };

    fetchProducts();
  }, [categoryId, isAuthenticated, navigate]);

  const handleViewDetail = async (productId) => {
    try {
      const response = await BASE_URL.get(`/products/${productId}`);
      setSelectedProduct(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      toast.error('Không thể tải chi tiết sản phẩm!', { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (productId) => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }

    const userId = user?.userId;
    if (!userId) {
      toast.error('Không tìm thấy thông tin người dùng!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const requestDTO = { productId, quantity: 1 };
    dispatch(addToCart({ userId, requestDTO }))
      .unwrap()
      .then(() => {
        toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'top-right', autoClose: 3000 });
      })
      .catch((error) => {
        toast.error('Không thể thêm sản phẩm vào giỏ hàng!', { position: 'top-right', autoClose: 3000 });
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
      });
  };

  if (loadingProducts) return <div>Đang tải...</div>;

  return (
    <div>
      <HeaderUser />
      <Banner />
      <Container className="category-products-page">
        <h1>
          {categoryId === '1' ? 'Đồng hồ nam' : categoryId === '2' ? 'Đồng hồ nữ' : 'Cặp đôi'}
        </h1>
        {errorProducts ? (
          <div className="text-center text-danger">{errorProducts}</div>
        ) : (
          <Row>
            {products.length > 0 ? (
              products.map((product) => (
                <Col md={4} key={product.productId} className="mb-4">
                  <Card className="product-card">
                    <Card.Img variant="top" src={product.image} alt={product.productName} />
                    <Card.Body>
                      <Card.Title>{product.productName}</Card.Title>
                      <Card.Text className="product-specs">
                        {product.specs || 'Bentley Nam - 40mm - Kính Sapphire'}
                      </Card.Text>
                      <Card.Text className="product-price">
                        Giá: {product.unitPrice.toLocaleString('vi-VN')} VNĐ
                      </Card.Text>
                      {product.originalPrice && (
                        <Card.Text className="product-original-price">
                          Giá gốc: {product.originalPrice.toLocaleString('vi-VN')} VNĐ
                        </Card.Text>
                      )}
                      <Button
                        variant="primary"
                        className="view-detail-btn"
                        onClick={() => handleViewDetail(product.productId)}
                      >
                        Xem chi tiết
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center">Không có sản phẩm nào cho danh mục này.</p>
              </Col>
            )}
          </Row>
        )}

        {blogPosts.length > 0 && (
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
        )}
      </Container>

      <ProductModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        selectedProduct={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      <FooterUser />
    </div>
  );
};

export default CategoryProductsPageUser;