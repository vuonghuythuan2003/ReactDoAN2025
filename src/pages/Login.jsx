import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../redux/reducers/AuthSlice';
import { Form, Input, Button, Typography, ConfigProvider, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading, validationErrors } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const result = await dispatch(loginUser({ username: values.username, password: values.password }));
    if (loginUser.fulfilled.match(result)) {
      const roles = result.payload.roles.map((role) => role.roleName || role);
      toast.success('Đăng nhập thành công!', { position: 'top-right', autoClose: 3000 });
      if (roles.includes('ADMIN')) {
        navigate('/admin');
      } else if (roles.includes('USER')) {
        navigate('/user');
      } else {
        navigate('/');
      }
    } else {
      // Xử lý lỗi từ backend
      if (result.payload?.code === 400 && result.payload?.message) {
        // Lặp qua tất cả các lỗi trong result.payload.message và hiển thị qua toast
        Object.values(result.payload.message).forEach((error) => {
          toast.error(error, { position: 'top-right', autoClose: 3000 });
        });
      } else if (result.payload?.errors) {
        // Xử lý lỗi validate từ validationErrors (nếu có)
        Object.values(result.payload.errors).forEach((error) => {
          toast.error(error, { position: 'top-right', autoClose: 3000 });
        });
      } else {
        // Hiển thị lỗi chung nếu không có lỗi validate
        toast.error(result.payload?.message || 'Tài khoản hoặc mật khẩu không đúng', {
          position: 'top-right',
          autoClose: 3000,
        });
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
            width: 400,
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
            Đăng nhập tại đây
          </Title>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label={
                <Text style={{ color: '#fff' }}>
                  Tên đăng nhập <span style={{ color: '#ff4d4f' }}></span>
                </Text>
              }
              name="username"
              validateStatus={validationErrors.username ? 'error' : ''}
              help={
                validationErrors.username && (
                  <Text style={{ color: '#ff4d4f' }}>{validationErrors.username}</Text>
                )
              }
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input placeholder="Nhập tên người dùng đăng nhập" disabled={loading} />
            </Form.Item>
            <Form.Item
              label={
                <Text style={{ color: '#fff' }}>
                  Mật khẩu <span style={{ color: '#ff4d4f' }}></span>
                </Text>
              }
              name="password"
              validateStatus={validationErrors.password ? 'error' : ''}
              help={
                validationErrors.password && (
                  <Text style={{ color: '#ff4d4f' }}>{validationErrors.password}</Text>
                )
              }
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password placeholder="Mật khẩu" disabled={loading} />
            </Form.Item>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#fff',
                  fontSize: 14,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={loading}
                style={{
                  height: 40,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form.Item>
            {/* Thêm link "Đăng ký" */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                Bạn chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  Đăng ký ngay!
                </Link>
              </Text>
            </div>
          </Form>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 14,
                marginBottom: 16,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              }}
            >
              Đăng nhập bằng tài khoản mạng xã hội
            </Text>
            <Space size="middle">
              <Button
                icon={<FacebookOutlined />}
                shape="circle"
                style={{
                  background: '#3b5998',
                  border: 'none',
                  color: '#fff',
                  fontSize: 20,
                  width: 40,
                  height: 40,
                }}
                onClick={() => toast.info('Chức năng đang phát triển!', { position: 'top-right', autoClose: 3000 })}
              />
              <Button
                icon={<TwitterOutlined />}
                shape="circle"
                style={{
                  background: '#1da1f2',
                  border: 'none',
                  color: '#fff',
                  fontSize: 20,
                  width: 40,
                  height: 40,
                }}
                onClick={() => toast.info('Chức năng đang phát triển!', { position: 'top-right', autoClose: 3000 })}
              />
              <Button
                icon={<InstagramOutlined />}
                shape="circle"
                style={{
                  background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 20,
                  width: 40,
                  height: 40,
                }}
                onClick={() => toast.info('Chức năng đang phát triển!', { position: 'top-right', autoClose: 3000 })}
              />
            </Space>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;