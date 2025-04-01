import React, { useState } from 'react';
import { Container, Row, Col, Form, FormControl } from 'react-bootstrap';
import CardProduct from './CardProduct';

const ProductList = ({ products, onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((item) =>
    (item.productName && item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section className="product-section">
      <Container>
        <h2 className="text-center">Sản phẩm nổi bật</h2>
        <div className="search-bar mb-4 d-flex justify-content-center">
          <Form inline className="w-50">
            <FormControl
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="mr-sm-2 w-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
        </div>
        <Row>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <Col lg={4} md={6} sm={12} key={item.productId} className="mb-4">
                <CardProduct product={item} onViewDetail={onViewDetail} />
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">Không tìm thấy sản phẩm nào.</p>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default ProductList;