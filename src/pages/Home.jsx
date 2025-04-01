import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Banner from '../components/Banner';
import ProductList from '../components/ProductList';
import BrandList from '../components/BrandList';
import ProductModal from '../components/ProductModal';
import '../styles/Home.scss';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const productResponse = await axios.get('http://localhost:8080/api/v1/admin/products');
      console.log('Dữ liệu sản phẩm:', productResponse.data);
      setProducts(productResponse.data.content || productResponse.data);

      const brandResponse = await axios.get('http://localhost:8080/api/v1/admin/brands');
      console.log('Dữ liệu thương hiệu:', brandResponse.data);
      setBrands(brandResponse.data.content || brandResponse.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetail = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/admin/products/${productId}`);
      setSelectedProduct(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <h3>Đang tải dữ liệu...</h3>
        </div>
      ) : (
        <>
          <div className="banner-container">
            <Banner />
          </div>
          <ProductList products={products} onViewDetail={handleViewDetail} />
          <BrandList brands={brands} />
          <ProductModal
            showModal={showModal}
            handleCloseModal={handleCloseModal}
            selectedProduct={selectedProduct}
          />
        </>
      )}
    </>
  );
};

export default Home;