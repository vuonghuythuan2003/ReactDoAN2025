import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BASE_URL, BASE_URL_USER } from '../api/index';
import ProductModal from '../components/ProductModal';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/reducers/CartSlice'; // Import addToCart từ Redux
import 'react-toastify/dist/ReactToastify.css';
import '../styles/BrandProductsPage.scss';
import HeaderUser from '../pages/users/HeaderUser';
import FooterUser from '../pages/users/FooterUser';

const BrandProductsPage = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorBrands, setErrorBrands] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBrands = async () => {
      setLoadingBrands(true);
      setErrorBrands(null);
      try {
        const response = await BASE_URL_USER.get('/brands');
        console.log('Brands API Response:', response.data);
        const brandsData = response.data.content || [];
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setLoadingBrands(false);
      } catch (err) {
        setErrorBrands('Không thể tải danh sách thương hiệu.');
        setLoadingBrands(false);
        console.error('Lỗi khi lấy danh sách thương hiệu:', err.response?.data || err.message);
      }
    };

    fetchBrands();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!brandId) {
      setLoadingProducts(false);
      setErrorProducts('Không có thương hiệu được chọn.');
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const response = await BASE_URL_USER.get(`/brands/${brandId}`);
        console.log('Products API Response:', response.data);
        const productsData = response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoadingProducts(false);
      } catch (err) {
        setErrorProducts('Không thể tải danh sách sản phẩm.');
        setLoadingProducts(false);
        console.error('Lỗi khi lấy sản phẩm:', err.response?.data || err.message);
      }
    };

    fetchProducts();
  }, [brandId]);

  const handleBrandClick = (brandId) => {
    navigate(`/user/brands/${brandId}`);
  };

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

  if (loadingBrands) return <div>Đang tải danh sách thương hiệu...</div>;

  return (
    <div>
      <HeaderUser />
      <Container className="brand-products-page">
        <Row>
          <Col md={3}>
            <div className="brand-filter">
              <h3>THƯƠNG HIỆU</h3>
              <hr />
              {errorBrands ? (
                <p className="text-danger">{errorBrands}</p>
              ) : brands.length > 0 ? (
                <ul className="brand-list">
                  {brands.map((brand) => (
                    <li
                      key={brand.brandId}
                      className={`brand-item ${brandId === String(brand.brandId) ? 'active' : ''}`}
                      onClick={() => handleBrandClick(brand.brandId)}
                    >
                      {brand.brandName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Không có thương hiệu nào để hiển thị.</p>
              )}
            </div>
          </Col>

          <Col md={9}>
            <h1>
              Sản phẩm của thương hiệu{' '}
              {brands.find((brand) => String(brand.brandId) === brandId)?.brandName || ''}
            </h1>
            {loadingProducts ? (
              <div className="text-center">Đang tải sản phẩm...</div>
            ) : errorProducts ? (
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
                          <Card.Text>{product.description}</Card.Text>
                          <Card.Text>Giá: {product.unitPrice.toLocaleString('vi-VN')} VNĐ</Card.Text>
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
                    <p className="text-center">Không có sản phẩm nào cho thương hiệu này.</p>
                  </Col>
                )}
              </Row>
            )}
          </Col>
        </Row>
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

export default BrandProductsPage;