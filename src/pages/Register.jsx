import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from '../css/Register.module.css';

function Register() {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/sign-up', values);
      console.log('Đăng ký thành công:', response.data);
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Đăng ký thất bại!');
      } else {
        console.error('Lỗi kết nối:', error.message);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <div
        className="register-container"
        style={{
          width: '450px',
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          animation: 'fadeIn 0.5s ease-in-out',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '28px',
            color: '#1a73e8',
            fontWeight: 'bold',
          }}
        >
          Đăng Ký
        </h2>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Tên người dùng không được để trống!' },
              { min: 6, max: 100, message: 'Tên người dùng phải từ 6 đến 100 ký tự!' },
              { pattern: /^[a-zA-Z0-9]+$/, message: 'Tên người dùng không được chứa ký tự đặc biệt!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên người dùng"
              size="large"
              style={{ borderRadius: '8px' }}
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
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              style={{ borderRadius: '8px' }}
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
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
              style={{ borderRadius: '8px' }}
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
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: 'Họ và tên không được để trống!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Họ và tên"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
          >
            <Input
              prefix={<HomeOutlined />}
              placeholder="Địa chỉ"
              size="large"
              style={{ borderRadius: '8px' }}
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
              prefix={<PhoneOutlined />}
              placeholder="Số điện thoại"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{
                backgroundColor: '#1a73e8',
                borderColor: '#1a73e8',
                borderRadius: '8px',
                height: '45px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
            >
              Đăng Ký Ngay
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#888' }}>
          Đã có tài khoản?{' '}
          <a href="/login" style={{ color: '#1a73e8' }}>Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
