import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const BrandList = ({ brands }) => {
  return (
    <section className="brand-section">
      <Container>
        <h2 className="text-center">Thương hiệu nổi bật</h2>
        <Row className="justify-content-center">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <Col xs={6} sm={4} md={2} key={brand.brandId} className="mb-4">
                <a href={`/brands/${brand.brandId}`}>
                  <img
                    src={brand.logo || 'https://picsum.photos/150/80?random=4'}
                    alt={brand.brandName}
                    className="brand-logo"
                    onError={(e) => (e.target.src = 'https://picsum.photos/150/80?random=4')}
                  />
                </a>
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">Không có thương hiệu nào để hiển thị.</p>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default BrandList;