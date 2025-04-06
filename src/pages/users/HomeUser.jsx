import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/index';
import { Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Banner from '../../components/Banner';
import ProductList from '../../components/ProductList';
import ProductModal from '../../components/ProductModal';
import '../../styles/Home.scss';
import HeaderUser from './HeaderUser';
import FooterUser from './FooterUser';
import { addToCart, fetchCartItems } from '../../redux/reducers/CartSlice';

const HomeUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Không cần isAuthenticated vì đã có PrivateRoute
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    {
      id: 1,
      title: "Xây dựng phần mềm bán đồng hồ: Bước đầu tiên để thành công",
      excerpt: "Tìm hiểu các bước cơ bản để phát triển một phần mềm bán đồng hồ hiệu quả, từ thiết kế giao diện đến tích hợp API.",
      thumbnail: '../image/webdongho.png',
      createdAt: '2025-04-01',
    },
    {
      id: 2,
      title: "Tối ưu hóa trải nghiệm người dùng trong phần mềm bán đồng hồ",
      excerpt: "Làm thế nào để tạo ra một giao diện thân thiện và thu hút khách hàng khi mua đồng hồ trực tuyến?",
      thumbnail: '../image/toiuuhoanguoidung.jpg',
      createdAt: '2025-03-28',
    },
    {
      id: 3,
      title: "Tích hợp thanh toán trực tuyến cho phần mềm bán đồng hồ",
      excerpt: "Hướng dẫn chi tiết cách tích hợp các cổng thanh toán như VNPay, MoMo vào phần mềm bán đồng hồ.",
      thumbnail: '../image/Thumb2-VNpay-800x450-640x360.jpg',
      createdAt: '2025-03-25',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        fetchData();
      }
    }, 700);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  async function fetchData() {
    setLoading(true);
    setIsSearching(false);
    try {
      const productResponse = await BASE_URL.get('/products');
      console.log('Dữ liệu sản phẩm:', productResponse.data);
      setProducts(productResponse.data.content || productResponse.data);

      const featuredResponse = await BASE_URL.get('/products/featured-products');
      console.log('Sản phẩm nổi bật:', featuredResponse.data);
      setFeaturedProducts(featuredResponse.data.content || featuredResponse.data);

      const newResponse = await BASE_URL.get('/products/new-products');
      console.log('Sản phẩm mới:', newResponse.data);
      setNewProducts(newResponse.data.content || newResponse.data);

      const bestSellerResponse = await BASE_URL.get('/products/best-seller-products');
      console.log('Sản phẩm bán chạy:', bestSellerResponse.data);
      setBestSellerProducts(bestSellerResponse.data.content || bestSellerResponse.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      toast.error('Không thể tải dữ liệu!', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  }

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

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await BASE_URL.get('/products/search', {
        params: { keyword: searchQuery },
      });
      console.log('Kết quả tìm kiếm:', response.data);
      setProducts(response.data.content || response.data);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      toast.error('Không thể tìm kiếm sản phẩm!', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user || !user.userId) {
      toast.error('Không tìm thấy thông tin người dùng! Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }

    const userId = user.userId;
    try {
      const requestDTO = { productId, quantity: 1 };
      await dispatch(addToCart({ userId, requestDTO })).unwrap();
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { position: 'top-right', autoClose: 3000 });
      dispatch(fetchCartItems(userId));
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng!', { position: 'top-right', autoClose: 3000 });
    }
  };

  return (
    <div className="home-container">
      <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
        <div style={{ minHeight: '100vh' }}>
          <HeaderUser />

          {/* Hiển thị lời chào cá nhân hóa */}
          {user?.username && (
            <div className="greeting-container" style={{ textAlign: 'center', margin: '20px 0' }}>
              <h2 style={{ color: '#333', fontSize: '24px' }}>
                Xin chào, {user.username}!
              </h2>
            </div>
          )}

          <div className="banner-container">
            <Banner />
          </div>

          <div className="search-container">
            <h2>Tìm kiếm sản phẩm</h2>
            <div className="search-wrapper">
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="large"
                prefix={<SearchOutlined />}
                suffix={isSearching && <Spin size="small" />}
                className="search-input"
              />
            </div>
            {products.length === 0 && searchQuery && (
              <p className="no-results">Không tìm thấy sản phẩm nào.</p>
            )}
          </div>

          {featuredProducts.length > 0 && !searchQuery && (
            <div className="product-section">
              <h2>Sản phẩm nổi bật</h2>
              <ProductList products={featuredProducts} onViewDetail={handleViewDetail} />
            </div>
          )}

          {newProducts.length > 0 && !searchQuery && (
            <div className="product-section">
              <h2>Sản phẩm mới</h2>
              <ProductList products={newProducts} onViewDetail={handleViewDetail} />
            </div>
          )}

          {bestSellerProducts.length > 0 && !searchQuery && (
            <div className="product-section">
              <h2>Sản phẩm bán chạy</h2>
              <ProductList products={bestSellerProducts} onViewDetail={handleViewDetail} />
            </div>
          )}

          {searchQuery && (
            <div className="product-section">
              <h2>Kết quả tìm kiếm</h2>
              <ProductList products={products} onViewDetail={handleViewDetail} />
            </div>
          )}

          {posts.length > 0 && !searchQuery && (
            <div className="post-section">
              <h2>Bài viết về xây dựng phần mềm bán đồng hồ</h2>
              <div className="post-list">
                {posts.map((post) => (
                  <Link to={`/posts/${post.id}`} key={post.id} className="post-item">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="post-image"
                      onError={(e) => (e.target.src = 'https://picsum.photos/300/200?random=1')}
                    />
                    <div className="post-content">
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <span className="post-date">{post.createdAt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <ProductModal
            showModal={showModal}
            handleCloseModal={handleCloseModal}
            selectedProduct={selectedProduct}
            onAddToCart={handleAddToCart}
          />

          <FooterUser />
        </div>
      </Spin>
    </div>
  );
};

export default HomeUser;