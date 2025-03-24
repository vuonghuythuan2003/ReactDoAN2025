import React, { useState } from 'react';
import { Form, Input, Button, Typography, Spin, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;

const AddCategory = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/v1/admin/categories', values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Thêm danh mục thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      form.resetFields();
      setTimeout(() => {
        navigate('/admin/category');
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      let errorMessage = 'Thêm danh mục thất bại! Vui lòng thử lại.';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).join(', ');
        }
        if (error.response.status === 400) {
          errorMessage = errorMessage || 'Dữ liệu không hợp lệ.';
        } else if (error.response.status === 500) {
          errorMessage = errorMessage || 'Lỗi server. Vui lòng thử lại sau.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    toast.error('Vui lòng kiểm tra lại các trường thông tin!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <>
      <style>
        {`
          /* Style cho form */
          .formContainer {
            background: #f0f7ff;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .ant-form-item-label > label {
            font-weight: 500;
            color: #333;
          }

          .ant-input,
          .ant-input-textarea {
            border-radius: 4px !important;
            border: 1px solid #d9d9d9 !important;
          }

          .ant-input:hover,
          .ant-input-textarea:hover {
            border-color: #1a73e8 !important;
          }

          .ant-input:focus,
          .ant-input-textarea:focus {
            border-color: #1a73e8 !important;
            box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
          }

          /* Style cho nút */
          .submitButton {
            background: #1a73e8;
            border-color: #1a73e8;
            border-radius: 4px;
            height: 40px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .submitButton:hover {
            background: #1557b0;
            border-color: #1557b0;
            transform: scale(1.05);
          }

          .cancelButton {
            border-radius: 4px;
            height: 40px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .cancelButton:hover {
            border-color: #f5222d;
            color: #f5222d;
            transform: scale(1.05);
          }

          /* Style cho Spin (loading) */
          .ant-spin-dot-item {
            background-color: #1a73e8;
          }

          .ant-spin-text {
            color: #1a73e8;
            font-weight: 500;
            margin-top: 10px;
          }

          /* Style cho toast */
          .Toastify__toast--success {
            background: #e6f7ff !important;
            color: #1a73e8 !important;
            font-weight: 500;
          }

          .Toastify__toast--error {
            background: #fff1f0 !important;
            color: #f5222d !important;
            font-weight: 500;
          }
        `}
      </style>

      <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
        Thêm danh mục mới
      </Title>
      <Spin spinning={loading} tip="Đang xử lý...">
        <div
          className="formContainer"
          style={{
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categoryName"
                  label="Tên danh mục"
                  rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                  <Input placeholder="Nhập tên danh mục" />
                </Form.Item>
              </Col>
              <Col span={12}>
                {/* Placeholder to balance the layout, since we only have two fields */}
                <div style={{ height: '100%' }}></div>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                className="submitButton"
                loading={loading}
                style={{ width: 150 }}
              >
                Thêm danh mục
              </Button>
              <Button
                className="cancelButton"
                style={{ marginLeft: 16, width: 150 }}
                onClick={() => navigate('/admin/category')}
              >
                Hủy
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </>
  );
};

export default AddCategory;