import React, { useEffect, useState } from 'react';
import CardProduct from '../components/CardProduct';
import { Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getDataFromAPI();
    }, []);

    async function getDataFromAPI() {
        const url = "http://localhost:8080/api/v1/admin/products";
        try {
            const response = await axios.get(url);
            console.log(response);
            setProducts(response.data.content);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Container>
            <h2 className='text-center'>Danh sách sản phẩm</h2>
            <Row>
                {products.map((item) => (
                    <Col lg={4} key={item.productId}>
                        <CardProduct product={item} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Home;
