import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchCartItems, updateCartItem, removeCartItem, clearCart, checkoutCart, checkoutCOD, checkoutSuccess, clearCheckoutRedirect } from '../../redux/reducers/CartSlice';
import HeaderUser from './HeaderUser';
import FooterUser from './FooterUser';
import { Card, Button, Form, Input, Row, Col, Typography, Space, Divider, Spin, Modal, Radio } from 'antd';

const { Title, Text } = Typography;

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, token } = useSelector((state) => state.auth);
    const { items, loading, error, totalItems, checkoutRedirectUrl, orderId, hasFetchedCart } = useSelector((state) => state.cart);
    const [form] = Form.useForm();
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('paypal'); // Mặc định là PayPal

    useEffect(() => {
        if (isAuthenticated && user?.userId && !hasFetchedCart && !loading) {
            dispatch(fetchCartItems(user.userId));
        } else if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để xem giỏ hàng!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
        }
    }, [isAuthenticated, user?.userId, dispatch, navigate, hasFetchedCart, loading]);

    useEffect(() => {
        if (checkoutRedirectUrl) {
            window.location.href = checkoutRedirectUrl;
            dispatch(clearCheckoutRedirect());
        }
    }, [checkoutRedirectUrl, dispatch]);

    useEffect(() => {
        if (orderId) {
            const totalPrice = calculateTotalPrice(); // Tính tổng tiền trước khi giỏ hàng thay đổi
            setOrderInfo({ orderId, totalPrice });
            toast.success('Đặt hàng COD thành công!', { position: 'top-right', autoClose: 3000 });
            dispatch(clearCheckoutRedirect());
            dispatch(fetchCartItems(user.userId)); // Đồng bộ giỏ hàng sau COD
        }
    }, [orderId, dispatch, user?.userId]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('paymentId');
        const payerId = searchParams.get('PayerID');
        const userId = searchParams.get('userId');
        const receiveAddress = searchParams.get('receiveAddress');
        const receiveName = searchParams.get('receiveName');
        const receivePhone = searchParams.get('receivePhone');
        const note = searchParams.get('note');

        if (location.pathname.includes('/success') && paymentId && payerId && userId) {
            dispatch(checkoutSuccess({ paymentId, payerId, userId, receiveAddress, receiveName, receivePhone, note }))
                .unwrap()
                .then((data) => {
                    const orderId = data.message.split('Mã đơn hàng: ')[1] || 'N/A';
                    const totalPrice = calculateTotalPrice(); // Tính tổng tiền trước khi xóa giỏ hàng
                    setOrderInfo({ orderId, totalPrice });
                    toast.success('Thanh toán PayPal thành công!', { position: 'top-right', autoClose: 3000 });
                    dispatch(clearCart(user.userId));
                })
                .catch((error) => {
                    toast.error(error || 'Xác nhận thanh toán thất bại!', { position: 'top-right', autoClose: 3000 });
                    navigate('/user/cart');
                });
        } else if (location.pathname.includes('/cancel')) {
            fetch(`http://localhost:8080/api/v1/user/cart/checkout/cancel`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    toast.info(data.message || 'Thanh toán đã bị hủy!', { position: 'top-right', autoClose: 3000 });
                    dispatch(clearCheckoutRedirect());
                    navigate('/user/cart');
                })
                .catch(error => {
                    toast.error('Lỗi khi xử lý hủy thanh toán!', { position: 'top-right', autoClose: 3000 });
                    navigate('/user/cart');
                });
        }
    }, [location.pathname, location.search, dispatch, navigate, user?.userId, token]);

    const handleQuantityChange = (cartItemId, quantity) => {
        if (quantity < 1) return;
        dispatch(updateCartItem({ cartItemId, quantity }))
            .unwrap()
            .then(() => toast.success('Cập nhật số lượng thành công!', { position: 'top-right', autoClose: 3000 }))
            .catch((error) => {
                toast.error(error || 'Cập nhật số lượng thất bại!', { position: 'top-right', autoClose: 3000 });
                if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                    navigate('/login');
                }
            });
    };

    const handleRemoveItem = (cartItemId) => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        dispatch(removeCartItem({ userId: user.userId, cartItemId }))
            .unwrap()
            .then(() => toast.success('Đã xóa sản phẩm khỏi giỏ hàng!', { position: 'top-right', autoClose: 3000 }))
            .catch((error) => {
                toast.error(error || 'Xóa sản phẩm thất bại!', { position: 'top-right', autoClose: 3000 });
                if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                    navigate('/login');
                }
            });
    };

    const handleClearCart = () => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng không?')) {
            dispatch(clearCart(user.userId))
                .unwrap()
                .then(() => toast.success('Đã xóa toàn bộ giỏ hàng!', { position: 'top-right', autoClose: 3000 }))
                .catch((error) => {
                    toast.error(error || 'Xóa giỏ hàng thất bại!', { position: 'top-right', autoClose: 3000 });
                    if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                        navigate('/login');
                    }
                });
        }
    };

    const redirectToLogin = () => {
        toast.warning('Vui lòng đăng nhập để thực hiện thao tác này!', { position: 'top-right', autoClose: 3000 });
        navigate('/login');
    };

    const handleCheckout = async () => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        if (items.length === 0) {
            toast.error('Giỏ hàng trống, không thể thanh toán!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        try {
            const values = await form.validateFields();
            setPaymentLoading(true);
            const checkoutData = {
                userId: user.userId,
                receiveAddress: values.receiveAddress,
                receiveName: values.receiveName,
                receivePhone: values.receivePhone,
                note: values.note || 'Không có ghi chú',
            };
            const totalPrice = calculateTotalPrice(); // Tính tổng tiền trước khi thanh toán

            if (paymentMethod === 'paypal') {
                dispatch(checkoutCart(checkoutData))
                    .unwrap()
                    .then((response) => {
                        if (response.redirectUrl) {
                            window.location.href = response.redirectUrl;
                        } else {
                            throw new Error('Không nhận được URL thanh toán từ server');
                        }
                    })
                    .catch((error) => {
                        toast.error(error || 'Khởi tạo thanh toán PayPal thất bại!', { position: 'top-right', autoClose: 3000 });
                        if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                            navigate('/login');
                        }
                    })
                    .finally(() => setPaymentLoading(false));
            } else if (paymentMethod === 'cod') {
                dispatch(checkoutCOD(checkoutData))
                    .unwrap()
                    .then((response) => {
                        setOrderInfo({ orderId: response.orderId, totalPrice }); // Lưu tổng tiền trước khi giỏ hàng thay đổi
                        dispatch(fetchCartItems(user.userId)); // Đồng bộ giỏ hàng
                    })
                    .catch((error) => {
                        toast.error(error || 'Khởi tạo thanh toán COD thất bại!', { position: 'top-right', autoClose: 3000 });
                        if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                            navigate('/login');
                        }
                    })
                    .finally(() => setPaymentLoading(false));
            }
        } catch (error) {
            setPaymentLoading(false);
            toast.error('Vui lòng điền đầy đủ thông tin giao hàng!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const calculateTotalPrice = () => {
        return items.reduce((total, item) => total + (item.unitPrice || 0) * (item.orderQuantity || 0), 0);
    };

    const calculateTotalPriceInUSD = () => {
        const totalVND = calculateTotalPrice();
        const exchangeRate = 1 / 24000;
        return (totalVND * exchangeRate).toFixed(2);
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
                                    <Text style={{ color: '#6c757d' }}>
                                        (~${calculateTotalPriceInUSD()} USD)
                                    </Text>
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
                                        { max: 15, message: 'Số điện thoại không được dài quá 15 ký tự!' },
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại" maxLength={15} />
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
                                <Form.Item label="Phương thức thanh toán">
                                    <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                        <Radio value="paypal">Thanh toán qua PayPal (~${calculateTotalPriceInUSD()} USD)</Radio>
                                        <Radio value="cod">Thanh toán khi nhận hàng (COD)</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ borderRadius: '5px' }} loading={paymentLoading}>
                                        {paymentMethod === 'paypal' ? 'Thanh toán qua PayPal' : 'Đặt hàng COD'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </>
                )}
            </div>
            <FooterUser />
            <Modal
                title="Thanh toán thành công!"
                open={!!orderInfo}
                onCancel={() => {
                    setOrderInfo(null);
                    navigate('/user');
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setOrderInfo(null);
                            navigate('/user');
                        }}
                    >
                        Đóng
                    </Button>,
                ]}
            >
                {orderInfo && (
                    <div>
                        <Text strong>Mã đơn hàng:</Text> <Text>{orderInfo.orderId || 'N/A'}</Text>
                        <br />
                        <Text strong>Tổng tiền:</Text> <Text>{orderInfo.totalPrice.toLocaleString('vi-VN')} VNĐ {paymentMethod === 'paypal' ? `(~${(orderInfo.totalPrice / 24000).toFixed(2)} USD)` : ''}</Text>
                        <br />
                        <Text style={{ color: '#ff4d4f' }}>
                            Đơn hàng sẽ được giao trong thời gian sớm nhất! Cảm ơn bạn đã mua hàng!
                        </Text>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CartPage;