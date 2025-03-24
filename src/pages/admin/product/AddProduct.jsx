import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Upload, Button, Typography, Spin, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Option } = Select;

const AddProduct = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/admin/categories', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data.content || response.data;
        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu danh mục không đúng định dạng.');
        }
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
        toast.error('Không thể lấy danh sách danh mục!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };
    fetchCategories();
  }, []);

  // Handle file upload change
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', values.productName);
      formData.append('sku', values.sku);
      formData.append('description', values.description || '');
      formData.append('unitPrice', values.unitPrice);
      formData.append('stockQuantity', values.stockQuantity);
      formData.append('soldQuantity', values.soldQuantity || 0);
      formData.append('categoryId', values.categoryId);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const response = await axios.post('http://localhost:8080/api/v1/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast.success('Thêm sản phẩm thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      form.resetFields();
      setFileList([]);
      navigate('/admin/product');
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      let errorMessage = 'Thêm sản phẩm thất bại! Vui lòng thử lại.';
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

  // Handle form submission failure (validation errors)
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại các trường thông tin!');
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
          .ant-input-number,
          .ant-select-selector {
            border-radius: 4px !important;
            border: 1px solid #d9d9d9 !important;
          }

          .ant-input:hover,
          .ant-input-number:hover,
          .ant-select-selector:hover {
            border-color: #1a73e8 !important;
          }

          .ant-input:focus,
          .ant-input-number:focus,
          .ant-select-selector:focus {
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

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
       

        {/* Main Content */}
        <div style={{ flex: 1, padding: '40px' }}>
          <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
            Thêm sản phẩm mới
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
                initialValues={{
                  soldQuantity: 0,
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tên sản phẩm"
                      name="productName"
                      rules={[
                        { required: true, message: 'Tên sản phẩm không được để trống' },
                        { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự' },
                      ]}
                    >
                      <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="SKU"
                      name="sku"
                      rules={[
                        { required: true, message: 'SKU không được để trống' },
                        { max: 100, message: 'SKU không được vượt quá 100 ký tự' },
                      ]}
                    >
                      <Input placeholder="Nhập SKU" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Mô tả"
                  name="description"
                >
                  <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Đơn giá (VND)"
                      name="unitPrice"
                      rules={[
                        { required: true, message: 'Đơn giá không được để trống' },
                        { type: 'number', min: 0.01, message: 'Đơn giá phải lớn hơn 0' },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập đơn giá"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Số lượng tồn kho"
                      name="stockQuantity"
                      rules={[
                        { required: true, message: 'Số lượng tồn kho không được để trống' },
                        { type: 'number', min: 0, message: 'Số lượng tồn kho không được âm' },
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng tồn kho" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Số lượng đã bán"
                      name="soldQuantity"
                      rules={[{ type: 'number', min: 0, message: 'Số lượng đã bán không được âm' }]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng đã bán" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Danh mục"
                      name="categoryId"
                      rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                      <Select placeholder="Chọn danh mục">
                        {categories.map((category) => (
                          <Option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Hình ảnh"
                  name="image"
                >
                  <Upload
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                  </Upload>
                </Form.Item>

                <Form.Item style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="submitButton"
                    loading={loading}
                    style={{ width: 150 }}
                  >
                    Thêm sản phẩm
                  </Button>
                  <Button
                    className="cancelButton"
                    style={{ marginLeft: 16, width: 150 }}
                    onClick={() => navigate('/admin/product')}
                  >
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default AddProduct;