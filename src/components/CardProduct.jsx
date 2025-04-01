// src/components/CardProduct.jsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import '../styles/CardProduct.scss';

const CardProduct = ({ product, onViewDetail }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Img
        variant="top"
        src={product.image || 'https://picsum.photos/300?random=1'}
        alt={product.productName}
        onError={(e) => (e.target.src = 'https://picsum.photos/300?random=1')} 
      />
      <Card.Body>
        <Card.Title className="text-center">{product.productName || 'Không có tên'}</Card.Title>
        <Card.Text className="text-center">
          {product.description || 'Không có mô tả'}
        </Card.Text>
        <Card.Text className="text-center text-danger">
          {product.unitPrice != null ? product.unitPrice.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ
        </Card.Text>
        <Button variant="primary" className="w-100" onClick={() => onViewDetail(product.productId)}>
          Xem chi tiết
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CardProduct;