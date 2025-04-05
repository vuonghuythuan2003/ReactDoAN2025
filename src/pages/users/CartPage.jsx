import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchCartItems, updateCartItem, removeCartItem, clearCart, checkoutCart, clearCheckoutRedirect } from '../../redux/reducers/CartSlice';
import HeaderUser from './HeaderUser';
import FooterUser from './FooterUser';
import { Card, Button, Form, Input, Row, Col, Typography, Space, Divider, Spin } from 'antd';

const { Title, Text } = Typography;

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { items, loading, error, totalItems, checkoutRedirectUrl } = useSelector((state) => state.cart);
    const [form] = Form.useForm();
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để xem giỏ hàng!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
            return;
        }
        if (user?.userId) {
            dispatch(fetchCartItems(user.userId));
        }
    }, [isAuthenticated, user, dispatch, navigate]);

    useEffect(() => {
        if (checkoutRedirectUrl) {
            window.location.href = checkoutRedirectUrl;
        }
    }, [checkoutRedirectUrl]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('paymentId');
        const payerId = searchParams.get('PayerID');
        if (location.pathname.includes('/success') && paymentId && payerId) {
            dispatch(clearCart(user.userId))
                .unwrap()
                .then(() => {
                    toast.success('Thanh toán thành công!', { position: 'top-right', autoClose: 3000 });
                    navigate('/user');
                })
                .catch((error) => {
                    toast.error('Lỗi khi xóa giỏ hàng sau thanh toán!', { position: 'top-right', autoClose: 3000 });
                    console.error('Lỗi:', error);
                });
            dispatch(clearCheckoutRedirect());
        } else if (location.pathname.includes('/cancel')) {
            toast.info('Thanh toán đã bị hủy!', { position: 'top-right', autoClose: 3000 });
            dispatch(clearCheckoutRedirect());
            navigate('/user/cart');
        }
    }, [location, dispatch, navigate, user]);

    const handleQuantityChange = (cartItemId, quantity) => {
        if (quantity < 1) return;
        dispatch(updateCartItem({ cartItemId, quantity }))
            .unwrap()
            .then(() => toast.success('Cập nhật số lượng thành công!', { position: 'top-right', autoClose: 3000 }))
            .catch((error) => {
                toast.error('Cập nhật số lượng thất bại!', { position: 'top-right', autoClose: 3000 });
                console.error('Lỗi khi cập nhật số lượng:', error);
            });
    };

    const handleRemoveItem = (cartItemId) => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        dispatch(removeCartItem({ userId: user.userId, cartItemId }))
            .unwrap()
            .then(() => toast.success('Đã xóa sản phẩm khỏi giỏ hàng!', { position: 'top-right', autoClose: 3000 }))
            .catch((error) => {
                toast.error('Xóa sản phẩm thất bại!', { position: 'top-right', autoClose: 3000 });
                console.error('Lỗi khi xóa sản phẩm:', error);
            });
    };

    const handleClearCart = () => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng không?')) {
            dispatch(clearCart(user.userId))
                .unwrap()
                .then(() => toast.success('Đã xóa toàn bộ giỏ hàng!', { position: 'top-right', autoClose: 3000 }))
                .catch((error) => {
                    toast.error('Xóa giỏ hàng thất bại!', { position: 'top-right', autoClose: 3000 });
                    console.error('Lỗi khi xóa giỏ hàng:', error);
                });
        }
    };

    const redirectToLogin = () => {
        toast.warning('Vui lòng đăng nhập để thực hiện thao tác này!', { position: 'top-right', autoClose: 3000 });
        navigate('/login');
    };

    const handleCheckout = (values) => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();

        if (items.length === 0) {
            toast.error('Giỏ hàng trống, không thể thanh toán!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        setPaymentLoading(true);
        dispatch(checkoutCart({
            userId: user.userId,
            receiveAddress: values.receiveAddress,
            receiveName: values.receiveName,
            receivePhone: values.receivePhone,
            note: values.note || 'Không có ghi chú',
        }))
            .unwrap()
            .then((redirectUrl) => {
                window.location.href = redirectUrl;
            })
            .catch((error) => {
                const errorMessage = error || 'Khởi tạo thanh toán thất bại!';
                toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
                console.error('Lỗi khi khởi tạo thanh toán:', error);
            })
            .finally(() => {
                setPaymentLoading(false);
            });
    };

    const calculateTotalPrice = () => {
        return items.reduce((total, item) => total + (item.unitPrice || 0) * (item.orderQuantity || 0), 0);
    };

    if (loading || paymentLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin />
            </div>
        );
    }
    if (error) return <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</div>;

    return (
        <div>
            <HeaderUser />
            <div style={{ padding: '40px 20px', background: '#f5f7fa', minHeight: '100vh' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#2c3e50' }}>
                    Giỏ hàng của bạn ({totalItems} sản phẩm)
                </Title>
                {items.length === 0 ? (
                    <Text style={{ textAlign: 'center', display: 'block', fontSize: '1.2rem', color: '#6c757d' }}>
                        Giỏ hàng của bạn đang trống.
                    </Text>
                ) : (
                    <>
                        {items.map((item) => (
                            <Card
                                key={item.cartItemId || item.productId}
                                style={{ marginBottom: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
                                hoverable
                            >
                                <Row align="middle">
                                    <Col xs={24} md={4}>
                                        <img
                                            src={item.productImage || 'https://picsum.photos/200'}
                                            alt={item.productName}
                                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px 0 0 10px' }}
                                        />
                                    </Col>
                                    <Col xs={24} md={20}>
                                        <Row align="middle" style={{ padding: '0 20px' }}>
                                            <Col xs={24} md={16}>
                                                <Title level={4} style={{ margin: 0, color: '#343a40' }}>
                                                    {item.productName || 'Sản phẩm không tên'}
                                                </Title>
                                                <Text style={{ color: '#6c757d' }}>
                                                    Giá: {(item.unitPrice || 0).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                                <br />
                                                <Text style={{ color: '#6c757d' }}>
                                                    Tổng: {((item.unitPrice || 0) * (item.orderQuantity || 0)).toLocaleString('vi-VN')} VNĐ
                                                </Text>
                                            </Col>
                                            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                                                <Space>
                                                    <Button
                                                        onClick={() => handleQuantityChange(item.cartItemId, item.orderQuantity - 1)}
                                                        disabled={item.orderQuantity <= 1}
                                                        style={{ borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        -
                                                    </Button>
                                                    <Text style={{ fontSize: '1.1rem', fontWeight: 500 }}>{item.orderQuantity}</Text>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleQuantityChange(item.cartItemId, item.orderQuantity + 1)}
                                                        style={{ borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        +
                                                    </Button>
                                                    <Button
                                                        type="danger"
                                                        onClick={() => handleRemoveItem(item.cartItemId)}
                                                        style={{ borderRadius: '5px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Space>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                        <Divider />
                        <Row justify="end" style={{ margin: '20px 0' }}>
                            <Col>
                                <Space>
                                    <Title level={3} style={{ margin: 0, color: '#2c3e50' }}>
                                        Tổng tiền: {calculateTotalPrice().toLocaleString('vi-VN')} VNĐ
                                    </Title>
                                    <Button type="primary" danger onClick={handleClearCart} style={{ borderRadius: '5px' }}>
                                        Xóa toàn bộ giỏ hàng
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                        <Card
                            title={<Title level={3} style={{ margin: 0, color: '#2c3e50' }}>Thông tin giao hàng</Title>}
                            style={{ borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}
                        >
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleCheckout}
                                initialValues={{ receiveAddress: '', receiveName: '', receivePhone: '', note: '' }}
                            >
                                <Form.Item
                                    label="Họ tên người nhận"
                                    name="receiveName"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                >
                                    <Input placeholder="Nhập họ tên" />
                                </Form.Item>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="receivePhone"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                        { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' },
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                                <Form.Item
                                    label="Địa chỉ nhận hàng"
                                    name="receiveAddress"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                >
                                    <Input placeholder="Nhập địa chỉ" />
                                </Form.Item>
                                <Form.Item label="Ghi chú (tuỳ chọn)" name="note">
                                    <Input.TextArea rows={3} placeholder="Ghi chú cho đơn hàng" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ borderRadius: '5px' }} loading={paymentLoading}>
                                        Thanh toán qua PayPal
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </>
                )}
            </div>
            <FooterUser />
        </div>
    );
};

export default CartPage;