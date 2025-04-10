import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchUserOrderHistory,
    fetchOrderDetails,
    fetchOrdersByStatus,
    cancelOrder,
    clearOrderDetails,
    resetFetchStatus,
} from '../../redux/reducers/OrderSliceUser';
import HeaderUser from './HeaderUser';
import FooterUser from './FooterUser';
import { Card, Row, Col, Typography, Spin, Button, Modal, Select, Space } from 'antd';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;
const { Option } = Select;

const OrderHistoryPage = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { orderHistory, orderDetails, loading, error, hasFetchedHistory } = useSelector(
        (state) => state.userOrders
    );
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Ánh xạ trạng thái sang tiếng Việt
    const mapStatusToVietnamese = (status) => {
        switch (status) {
            case 'WAITING':
                return 'Chờ xử lý';
            case 'CONFIRM':
                return 'Đã xác nhận';
            case 'DELIVERY':
                return 'Đang giao';
            case 'SUCCESS':
                return 'Thành công';
            case 'CANCEL':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.userId && !hasFetchedHistory) {
            if (selectedStatus === 'ALL') {
                dispatch(fetchUserOrderHistory(user.userId));
            } else {
                dispatch(fetchOrdersByStatus({ status: selectedStatus, userId: user.userId }));
            }
        }
    }, [isAuthenticated, user?.userId, dispatch, hasFetchedHistory, selectedStatus]);

    const handleViewDetails = (serialNumber) => {
        dispatch(fetchOrderDetails(serialNumber)).then(() => {
            setIsModalVisible(true);
        });
    };

    const handleCancelOrder = (orderId) => {
        if (window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) {
            dispatch(cancelOrder(orderId))
                .unwrap()
                .then(() => {
                    toast.success('Hủy đơn hàng thành công!', { position: 'top-right', autoClose: 3000 });
                    dispatch(resetFetchStatus());
                })
                .catch((error) => {
                    toast.error(error || 'Hủy đơn hàng thất bại!', { position: 'top-right', autoClose: 3000 });
                });
        }
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        dispatch(resetFetchStatus());
        if (value === 'ALL') {
            dispatch(fetchUserOrderHistory(user.userId));
        } else {
            dispatch(fetchOrdersByStatus({ status: value, userId: user.userId }));
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        dispatch(clearOrderDetails());
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin />
            </div>
        );
    }

    if (error) {
        return <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</div>;
    }

    return (
        <div>
            <HeaderUser />
            <div style={{ padding: '40px 20px', background: '#f5f7fa', minHeight: '100vh' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>
                    Lịch sử mua hàng
                </Title>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Text strong style={{ marginRight: '10px' }}>
                        Lọc theo trạng thái:
                    </Text>
                    <Select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        style={{ width: 200 }}
                    >
                        <Option value="ALL">Tất cả</Option>
                        <Option value="WAITING">Chờ xử lý</Option>
                        <Option value="CONFIRM">Đã xác nhận</Option>
                        <Option value="DELIVERY">Đang giao</Option>
                        <Option value="SUCCESS">Thành công</Option>
                        <Option value="CANCEL">Đã hủy</Option>
                    </Select>
                </div>
                {orderHistory.length === 0 ? (
                    <Text style={{ textAlign: 'center', display: 'block', fontSize: '1.2rem', color: '#6c757d' }}>
                        Bạn chưa có đơn hàng nào.
                    </Text>
                ) : (
                    <Row gutter={[16, 16]}>
                        {orderHistory.map((order) => (
                            <Col xs={24} sm={12} md={8} key={order.orderId}>
                                <Card
                                    style={{
                                        borderRadius: '10px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        border: '1px solid #e8ecef',
                                    }}
                                >
                                    <Text strong>Mã đơn hàng: </Text>
                                    <Text>{order.orderId}</Text>
                                    <br />
                                    <Text strong>Ngày đặt hàng: </Text>
                                    <Text>
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                                            : 'Chưa có ngày'}
                                    </Text>
                                    <br />
                                    <Text strong>Tổng tiền: </Text>
                                    <Text>{order.totalPrice?.toLocaleString('vi-VN')} VNĐ</Text>
                                    <br />
                                    <Text strong>Trạng thái: </Text>
                                    <Text>{mapStatusToVietnamese(order.status)}</Text>
                                    <br />
                                    <Space style={{ marginTop: '8px' }}>
                                        <Button
                                            type="link"
                                            style={{ padding: 0 }}
                                            onClick={() => handleViewDetails(order.serialNumber)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                        {order.status === 'WAITING' && (
                                            <Button
                                                type="link"
                                                danger
                                                style={{ padding: 0 }}
                                                onClick={() => handleCancelOrder(order.orderId)}
                                            >
                                                Hủy đơn hàng
                                            </Button>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
            <FooterUser />

            {/* Modal hiển thị chi tiết đơn hàng */}
            <Modal
                title="Chi tiết đơn hàng"
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>,
                ]}
            >
                {orderDetails ? (
                    <div>
                        <Text strong>Mã đơn hàng: </Text>
                        <Text>{orderDetails.orderId}</Text>
                        <br />
                        <Text strong>Số serial: </Text>
                        <Text>{orderDetails.serialNumber}</Text>
                        <br />
                        <Text strong>Ngày đặt hàng: </Text>
                        <Text>
                            {orderDetails.createdAt
                                ? new Date(orderDetails.createdAt).toLocaleDateString('vi-VN')
                                : 'Chưa có ngày'}
                        </Text>
                        <br />
                        <Text strong>Ngày nhận dự kiến: </Text>
                        <Text>
                            {orderDetails.receivedAt
                                ? new Date(orderDetails.receivedAt).toLocaleDateString('vi-VN')
                                : 'Chưa có ngày'}
                        </Text>
                        <br />
                        <Text strong>Tổng tiền: </Text>
                        <Text>{orderDetails.totalPrice?.toLocaleString('vi-VN')} VNĐ</Text>
                        <br />
                        <Text strong>Trạng thái: </Text>
                        <Text>{mapStatusToVietnamese(orderDetails.status)}</Text>
                        <br />
                        <Text strong>Tên người nhận: </Text>
                        <Text>{orderDetails.receiveName}</Text>
                        <br />
                        <Text strong>Địa chỉ nhận: </Text>
                        <Text>{orderDetails.receiveAddress}</Text>
                        <br />
                        <Text strong>Số điện thoại: </Text>
                        <Text>{orderDetails.receivePhone}</Text>
                        <br />
                        <Text strong>Ghi chú: </Text>
                        <Text>{orderDetails.note || 'Không có ghi chú'}</Text>
                    </div>
                ) : (
                    <Text>Đang tải chi tiết đơn hàng...</Text>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistoryPage;