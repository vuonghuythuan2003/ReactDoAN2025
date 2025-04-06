import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../redux/reducers/GmailSlice';
import { Form, Input, Button, Typography, ConfigProvider } from 'antd';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.gmail);

  const handleSubmit = async (values) => {
    const result = await dispatch(
      resetPassword({ token: values.token, newPassword: values.newPassword })
    );
    if (resetPassword.fulfilled.match(result)) {
      toast.success(result.payload || 'Mật khẩu đã được đặt lại thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/login');
    } else {
      toast.error(result.payload || 'Đã xảy ra lỗi khi đặt lại mật khẩu', {
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
            Đặt lại mật khẩu
          </Title>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              label={<Text style={{ color: '#fff' }}>Mã xác nhận</Text>}
              name="token"
              validateStatus={error ? 'error' : ''}
              help={error && <Text style={{ color: '#ff4d4f' }}>{error}</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }]}
            >
              <Input placeholder="Nhập mã xác nhận từ email" disabled={loading} />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: '#fff' }}>Mật khẩu mới</Text>}
              name="newPassword"
              validateStatus={error ? 'error' : ''}
              help={error && <Text style={{ color: '#ff4d4f' }}>{error}</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" disabled={loading} />
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
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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

export default ResetPassword;