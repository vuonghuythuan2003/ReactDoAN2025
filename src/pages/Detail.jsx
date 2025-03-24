import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Detail() {
    let { id } = useParams(); 
    const [product, setProduct] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 

    useEffect(() => {
        const fetchProductDetail = async () => {
            const url = `http://localhost:8080/api/v1/admin/products/${id}`;
            try {
                const response = await axios.get(url);
                setProduct(response.data); 
                setLoading(false); 
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm!');
                setLoading(false);
                console.error(err);
            }
        };

        fetchProductDetail();
    }, [id]); 

    
    if (loading) {
        return <Container style={{ marginTop: '50px' }}>Đang tải...</Container>;
    }

    if (error) {
        return <Container style={{ marginTop: '50px' }}>{error}</Container>;
    }

    return (
        <Container style={{ marginTop: '50px', marginBottom: '200px' }}>
            <Row>
                <Col lg={6}>
                    <img
                        src={product.image || 'https://via.placeholder.com/250x350'} 
                        alt={product.productName}
                        width="250px"
                        height="350px"
                    />
                </Col>
                <Col lg={6}>
                    <h1>{product.productName}</h1>
                    <p>{product.description || 'Chưa có mô tả'}</p>
                    <p>
                        <strong>Giá: </strong>
                        {product.unitPrice ? `${product.unitPrice.toLocaleString()} VNĐ` : 'Chưa có giá'}
                    </p>
                    <input type="number" min="1" defaultValue="1" style={{ width: '60px', marginRight: '10px' }} />
                    <button className="btn btn-primary">Thêm vào giỏ hàng</button>
                </Col>
            </Row>
        </Container>
    );
}

export default Detail;