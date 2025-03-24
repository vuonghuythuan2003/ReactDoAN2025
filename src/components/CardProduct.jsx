import React from 'react'
import { Card } from 'react-bootstrap'; 
import { NavLink } from 'react-router-dom';

function CardProduct({ product }) {
  return (
    <>
    <Card style={{ width: '18rem' }} >
      <Card.Img 
        variant="top" 
        src={product.image} 
      />
      <Card.Body>
        <Card.Title>Tên sản phẩm: {product.productName}</Card.Title>
        <Card.Text>Mô Tả sản phẩm: {product.description}
        </Card.Text>
                <Card.Title>Giá sản phẩm: {product.unitPrice}</Card.Title>

        <NavLink className="btn btn-primary" to={`/product-detail/${product.productId}`} >Xem chi tiết</NavLink>
      </Card.Body>
    </Card>

    </>
  )
}

export default CardProduct