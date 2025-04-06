// File: src/pages/users/UserAccountModal.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserAccount, updateUserAccount, changePassword, resetUserAccount } from '../../redux/reducers/AccountUserSlice';
import { Modal, Tabs, Form, Input, Button, Typography, Spin, Avatar } from 'antd';
import { toast } from 'react-toastify';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const UserAccountModal = ({ visible, onClose, userId, onLogout }) => {
    const dispatch = useDispatch();
    const { userAccount, loading, error } = useSelector((state) => state.accountUser);
    const [updateForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        if (visible && userId) {
            dispatch(fetchUserAccount(userId));
        }
    }, [visible, userId, dispatch]);

    useEffect(() => {
        if (userAccount) {
            updateForm.setFieldsValue({
                fullname: userAccount.fullname,
                phone: userAccount.phone,
                address: userAccount.address,
                avatar: userAccount.avatar,
            });
        }
    }, [userAccount, updateForm]);

    const handleUpdateAccount = async (values) => {
        try {
            await dispatch(updateUserAccount({ userId, data: values })).unwrap();
            toast.success('Cập nhật thông tin thành công!', { position: 'top-right', autoClose: 3000 });
        } catch (error) {
            toast.error(error || 'Cập nhật thông tin thất bại!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleChangePassword = async (values) => {
        try {
            await dispatch(changePassword({ userId, data: values })).unwrap();
            toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
            passwordForm.resetFields();
            setTimeout(() => {
                onLogout();
                onClose();
            }, 3000);
        } catch (error) {
            toast.error(error || 'Đổi mật khẩu thất bại!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleLogout = () => {
        onLogout();
        onClose();
    };

    const handleClose = () => {
        dispatch(resetUserAccount());
        updateForm.resetFields();
        passwordForm.resetFields();
        onClose();
    };

    if (loading) {
        return (
            <Modal open={visible} onCancel={handleClose} footer={null}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin />
                </div>
            </Modal>
        );
    }

    if (error) {
        return (
            <Modal open={visible} onCancel={handleClose} footer={null}>
                <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</div>
            </Modal>
        );
    }

    return (
        <Modal
            open={visible}
            onCancel={handleClose}
            footer={null}
            title={<Title level={4}>Quản lý tài khoản</Title>}
            width={600}
        >
            <Tabs defaultActiveKey="1">
                {/* Tab 1: Thông tin tài khoản */}
                <TabPane tab="Thông tin tài khoản" key="1">
                    {userAccount ? (
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={100}
                                src={userAccount.avatar || 'https://via.placeholder.com/100'}
                                style={{ marginBottom: '20px' }}
                            />
                            <Text strong>Tên người dùng: </Text>
                            <Text>{userAccount.username}</Text>
                            <br />
                            <Text strong>Email: </Text>
                            <Text>{userAccount.email}</Text>
                            <br />
                            <Text strong>Họ tên: </Text>
                            <Text>{userAccount.fullname}</Text>
                            <br />
                            <Text strong>Số điện thoại: </Text>
                            <Text>{userAccount.phone || 'Chưa có'}</Text>
                            <br />
                            <Text strong>Địa chỉ: </Text>
                            <Text>{userAccount.address || 'Chưa có'}</Text>
                            <br />
                            <Text strong>Ngày tạo: </Text>
                            <Text>
                                {userAccount.createdAt
                                    ? new Date(userAccount.createdAt).toLocaleDateString('vi-VN')
                                    : 'Chưa có'}
                            </Text>
                            <br />
                            <Text strong>Ngày cập nhật: </Text>
                            <Text>
                                {userAccount.updatedAt
                                    ? new Date(userAccount.updatedAt).toLocaleDateString('vi-VN')
                                    : 'Chưa có'}
                            </Text>
                        </div>
                    ) : (
                        <Text>Đang tải thông tin...</Text>
                    )}
                </TabPane>

                {/* Tab 2: Cập nhật thông tin */}
                <TabPane tab="Cập nhật thông tin" key="2">
                    <Form
                        form={updateForm}
                        layout="vertical"
                        onFinish={handleUpdateAccount}
                    >
                        <Form.Item
                            label="Họ tên"
                            name="fullname"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                        >
                            <Input placeholder="Nhập họ tên" />
                        </Form.Item>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>
                        <Form.Item label="Ảnh đại diện (URL)" name="avatar">
                            <Input placeholder="Nhập URL ảnh đại diện" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>

                {/* Tab 3: Đổi mật khẩu */}
                <TabPane tab="Đổi mật khẩu" key="3">
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item
                            label="Mật khẩu cũ"
                            name="oldPass"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu cũ" />
                        </Form.Item>
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPass"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu mới" />
                        </Form.Item>
                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirmNewPass"
                            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
                        >
                            <Input.Password placeholder="Xác nhận mật khẩu mới" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Đổi mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                </TabPane>

                {/* Tab 4: Đăng xuất */}
                <TabPane tab="Đăng xuất" key="4">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text>Bạn có chắc chắn muốn đăng xuất không?</Text>
                        <div style={{ marginTop: '20px' }}>
                            <Button type="primary" danger onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default UserAccountModal;