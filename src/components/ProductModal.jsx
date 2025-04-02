import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const ProductModal = ({ showModal, handleCloseModal, selectedProduct, onAddToCart }) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedProduct ? (
          <Row>
            <Col md={6}>
              <img
                src={selectedProduct.image || 'https://picsum.photos/400?random=5'}
                alt={selectedProduct.productName}
                className="modal-img"
                onError={(e) => (e.target.src = 'https://picsum.photos/400?random=5')}
              />
            </Col>
            <Col md={6}>
              <h3 className="modal-title">{selectedProduct.productName || 'Không có tên'}</h3>
              <p className="modal-price">
                Giá: {selectedProduct.unitPrice != null ? selectedProduct.unitPrice.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedProduct.description || 'Không có mô tả'}
              </p>
              <Button
                variant="primary"
                onClick={() => onAddToCart(selectedProduct.productId)}
              >
                Thêm vào giỏ hàng
              </Button>
            </Col>
          </Row>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;