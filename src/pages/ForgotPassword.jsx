import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../redux/reducers/GmailSlice';
import { Form, Input, Button, Typography, ConfigProvider } from 'antd';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.gmail);

  const handleSubmit = async (values) => {
    const result = await dispatch(forgotPassword(values.email));
    if (forgotPassword.fulfilled.match(result)) {
      toast.success(
        'Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn và nhập mã xác nhận để đặt lại mật khẩu!',
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );
      navigate('/reset-password'); // Chuyển hướng đến trang nhập mã xác nhận
    } else {
      toast.error(result.payload || 'Đã xảy ra lỗi khi gửi yêu cầu khôi phục mật khẩu', {
        position: 'top-right',
        autoClose: 3000,
      });
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
            Quên mật khẩu
          </Title>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label={<Text style={{ color: '#fff' }}>Email</Text>}
              name="email"
              validateStatus={error ? 'error' : ''}
              help={error && <Text style={{ color: '#ff4d4f' }}>{error}</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input placeholder="Nhập email của bạn" disabled={loading} />
            </Form.Item>
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
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                Quay lại{' '}
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
};

export default ForgotPassword;