import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Input, Button, Typography, ConfigProvider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/sign-up', values);
      toast.success('Đăng ký thành công!', { position: 'top-right', autoClose: 3000 });
      navigate('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Đăng ký thất bại!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error('Lỗi kết nối: ' + error.message, { position: 'top-right', autoClose: 3000 });
      }
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1a73e8',
          borderRadius: 8,
          colorText: '#fff',
          colorBgContainer: 'rgba(255, 255, 255, 0.1)',
          colorBorder: 'rgba(255, 255, 255, 0.3)',
          controlHeight: 40,
          colorError: '#ff4d4f',
        },
        components: {
          Form: {
            labelColor: '#fff',
            itemMarginBottom: 16,
            labelFontSize: 14,
          },
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.2)',
            colorTextPlaceholder: 'rgba(255, 255, 255, 0.7)',
            colorBorder: 'rgba(255, 255, 255, 0.3)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.5)',
            activeBorderColor: 'rgba(255, 255, 255, 0.5)',
          },
          Button: {
            primaryShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundImage: 'url(https://haycafe.vn/wp-content/uploads/2022/03/Hinh-nen-rung-cay-xanh-thien-nhien.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        />
        <div
          style={{
            width: 450,
            padding: 32,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          <Title
            level={2}
            style={{
              color: '#fff',
              marginBottom: 24,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            Đăng Ký
          </Title>
          <Form form={form} onFinish={onFinish} layout="vertical" autoComplete="off">
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Tên người dùng không được để trống!' },
                { min: 6, max: 100, message: 'Tên người dùng phải từ 6 đến 100 ký tự!' },
                { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên người dùng không được chứa ký tự đặc biệt!' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Tên người dùng"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Email không được để trống!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Mật khẩu không được để trống!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Xác nhận mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Họ và tên không được để trống!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Họ và tên"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="address"
              rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
            >
              <Input
                prefix={<HomeOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Địa chỉ"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              rules={[
                { required: true, message: 'Số điện thoại không được để trống!' },
                { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                placeholder="Số điện thoại"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  height: 40,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                Đăng Ký Ngay
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  Đăng nhập
                </Link>
              </Text>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}
export default Register;