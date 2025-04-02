import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CardProduct from './CardProduct';

const ProductList = ({ products, onViewDetail }) => {
  return (
    <section className="product-section">
      <Container>
        <Row>
          {products.length > 0 ? (
            products.map((item) => (
              <Col lg={3} md={6} sm={12} key={item.productId} className="mb-4">
                <CardProduct product={item} onViewDetail={onViewDetail} />
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">Không có sản phẩm nào để hiển thị.</p>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default ProductList;