import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserAccount, updateUserAccount, changePassword, resetUserAccount } from '../../redux/reducers/AccountUserSlice';
import { fetchWishList, removeFromWishList, resetWishList } from '../../redux/reducers/WishListSlice';
import { Modal, Tabs, Form, Input, Button, Typography, Spin, Avatar, Upload, Table } from 'antd';
import { toast } from 'react-toastify';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserId, removeToken, removeUserId, removeRoles } from '../../api/index'; // Quản lý cookies

const { Title, Text } = Typography;

const UserAccountModal = ({ visible, onClose, userId, onLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userAccount, loading, error } = useSelector((state) => state.accountUser);
    const { wishList, loading: wishListLoading } = useSelector((state) => state.wishList);
    const [updateForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible && userId) {
            dispatch(fetchUserAccount(userId));
            dispatch(fetchWishList()); // Lấy danh sách WishList
        }
    }, [visible, userId, dispatch]);

    useEffect(() => {
        if (userAccount) {
            updateForm.setFieldsValue({
                fullname: userAccount.fullname,
                phone: userAccount.phone,
                address: userAccount.address,
            });
            setFileList(userAccount.avatar ? [{ uid: '-1', name: 'avatar', status: 'done', url: userAccount.avatar }] : []);
        }
    }, [userAccount, updateForm]);

    const handleUpdateAccount = async (values) => {
        try {
            const formData = new FormData();
            formData.append('fullname', values.fullname);
            formData.append('phone', values.phone);
            formData.append('address', values.address);
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('avatar', fileList[0].originFileObj);
            }

            await dispatch(updateUserAccount({ userId, data: formData })).unwrap();
            toast.success('Cập nhật thông tin thành công!', { position: 'top-right', autoClose: 3000 });
        } catch (error) {
            if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                toast.error(error, { position: 'top-right', autoClose: 3000 });
                setTimeout(() => {
                    handleLogout();
                    navigate('/login');
                }, 3000);
            } else {
                toast.error(error || 'Cập nhật thông tin thất bại!', { position: 'top-right', autoClose: 3000 });
            }
        }
    };

    const handleChangePassword = async (values) => {
        try {
            await dispatch(changePassword({ userId, data: values })).unwrap();
            toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', { position: 'top-right', autoClose: 3000 });
            passwordForm.resetFields();
            setTimeout(() => {
                handleLogout();
                onClose();
            }, 3000);
        } catch (error) {
            if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
                toast.error(error, { position: 'top-right', autoClose: 3000 });
                setTimeout(() => {
                    handleLogout();
                    navigate('/login');
                }, 3000);
            } else {
                toast.error(error || 'Đổi mật khẩu thất bại!', { position: 'top-right', autoClose: 3000 });
            }
        }
    };

    const handleRemoveFromWishList = async (wishListId) => {
        try {
            await dispatch(removeFromWishList(wishListId)).unwrap();
            toast.success('Đã xóa khỏi danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            dispatch(fetchWishList()); // Cập nhật lại danh sách
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleLogout = () => {
        removeToken(); // Xóa token
        removeUserId(); // Xóa userId
        removeRoles(); // Xóa roles
        onLogout(); // Gọi callback đăng xuất
        onClose(); // Đóng modal
        navigate('/login'); // Chuyển hướng về trang đăng nhập
    };

    const handleClose = () => {
        dispatch(resetUserAccount());
        dispatch(resetWishList());
        updateForm.resetFields();
        passwordForm.resetFields();
        setFileList([]);
        onClose();
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1));
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

    const wishListColumns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'productImage',
            key: 'productImage',
            render: (image) => (
                <img src={image || 'https://picsum.photos/50'} alt="product" style={{ width: 50, height: 50 }} />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (price != null ? price.toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => handleRemoveFromWishList(record.wishListId)}
                    disabled={wishListLoading}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin tài khoản',
            children: userAccount ? (
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
            ),
        },
        {
            key: '2',
            label: 'Cập nhật thông tin',
            children: (
                <Form form={updateForm} layout="vertical" onFinish={handleUpdateAccount}>
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
                    <Form.Item label="Ảnh đại diện">
                        <Upload
                            fileList={fileList}
                            onChange={handleFileChange}
                            beforeUpload={() => false}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: '3',
            label: 'Đổi mật khẩu',
            children: (
                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
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
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPass') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: '4',
            label: 'Danh sách yêu thích',
            children: (
                <div style={{ padding: '20px' }}>
                    <Table
                        columns={wishListColumns}
                        dataSource={wishList}
                        rowKey="wishListId"
                        pagination={false}
                        locale={{ emptyText: 'Bạn chưa có sản phẩm nào trong danh sách yêu thích.' }}
                    />
                </div>
            ),
        },
        {
            key: '5',
            label: 'Đăng xuất',
            children: (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text>Bạn có chắc chắn muốn đăng xuất không?</Text>
                    <div style={{ marginTop: '20px' }}>
                        <Button type="primary" danger onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Modal
            open={visible}
            onCancel={handleClose}
            footer={null}
            title={<Title level={4}>Quản lý tài khoản</Title>}
            width={600}
        >
            <Tabs items={tabItems} defaultActiveKey="1" />
        </Modal>
    );
};

export default UserAccountModal;