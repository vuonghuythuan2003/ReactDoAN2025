import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Typography, Spin, message, Image, Upload } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UploadOutlined } from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { Option } = Select;

const EditProduct = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams(); // Lấy productId từ URL (ví dụ: 6)
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialImage, setInitialImage] = useState(null); // Lưu URL hình ảnh hiện tại
  const [fileList, setFileList] = useState([]); // Quản lý danh sách file trong Upload

  // Lấy danh sách danh mục và thông tin sản phẩm khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách danh mục
        const categoryResponse = await axios.get('http://localhost:8080/api/v1/admin/categories');
        const categoryData = categoryResponse.data.content || categoryResponse.data;
        if (!Array.isArray(categoryData)) {
          throw new Error('Dữ liệu danh mục không đúng định dạng.');
        }
        setCategories(categoryData);

        // Lấy thông tin sản phẩm
        const productResponse = await axios.get(`http://localhost:8080/api/v1/admin/products/${productId}`);
        const productData = productResponse.data;
        console.log('Dữ liệu sản phẩm:', productData); // Kiểm tra dữ liệu trả về

        // Kiểm tra dữ liệu trước khi điền vào form
        if (!productData.productName || !productData.sku || productData.unitPrice == null || productData.stockQuantity == null || productData.categoryId == null) {
          throw new Error('Dữ liệu sản phẩm không hợp lệ. Vui lòng kiểm tra lại.');
        }

        // Điền dữ liệu vào form
        form.setFieldsValue({
          productName: productData.productName,
          sku: productData.sku,
          description: productData.description,
          unitPrice: productData.unitPrice,
          stockQuantity: productData.stockQuantity,
          soldQuantity: productData.soldQuantity || 0,
          categoryId: productData.categoryId,
        });

        // Lưu URL hình ảnh hiện tại (nếu có)
        if (productData.image) {
          setInitialImage(productData.image);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        let errorMessage = 'Không thể lấy dữ liệu sản phẩm!';
        if (error.response) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
          if (error.response.status === 404) {
            errorMessage = 'Sản phẩm không tồn tại.';
          } else if (error.response.status === 500) {
            errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate('/admin/product'); // Chuyển hướng về danh sách sản phẩm nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, form, navigate]);

  // Xử lý thay đổi file trong Upload
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Xử lý submit form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Tạo FormData để gửi dữ liệu dưới dạng multipart/form-data
      const formData = new FormData();
      formData.append('productName', values.productName?.trim());
      formData.append('sku', values.sku?.trim());
      formData.append('description', values.description || '');
      formData.append('unitPrice', parseFloat(values.unitPrice));
      formData.append('stockQuantity', values.stockQuantity);
      formData.append('soldQuantity', values.soldQuantity || 0);
      formData.append('categoryId', values.categoryId);

      // Chỉ thêm trường image nếu người dùng chọn file mới
      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        if (file) {
          formData.append('image', file);
        }
      }

      // Log FormData để kiểm tra dữ liệu gửi đi
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Gửi yêu cầu PUT đến API
      const response = await axios.put(`http://localhost:8080/api/v1/admin/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Cập nhật sản phẩm thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Chuyển hướng về trang danh sách sản phẩm
      navigate('/admin/product');
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      let errorMessage = 'Cập nhật sản phẩm thất bại! Vui lòng thử lại.';
      if (error.response) {
        console.log('Error response data:', error.response.data);
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
        } else if (error.response.status === 404) {
          errorMessage = 'Sản phẩm không tồn tại.';
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

  // Xử lý khi form submit thất bại (validation lỗi)
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại các trường thông tin!');
  };

  return (
    <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
        Chỉnh sửa sản phẩm
      </Title>
      <Spin spinning={loading} tip="Đang xử lý...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          style={{
            maxWidth: 600,
            margin: '0 auto',
            background: '#fff',
            padding: '24px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Form.Item
            label="Tên sản phẩm"
            name="productName"
            rules={[
              { required: true, message: 'Tên sản phẩm không được để trống' },
              { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự' },
              { whitespace: true, message: 'Tên sản phẩm không được chỉ chứa khoảng trắng' },
            ]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            label="SKU"
            name="sku"
            rules={[
              { required: true, message: 'SKU không được để trống' },
              { max: 100, message: 'SKU không được vượt quá 100 ký tự' },
              { whitespace: true, message: 'SKU không được chỉ chứa khoảng trắng' },
            ]}
          >
            <Input placeholder="Nhập SKU" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

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

          <Form.Item
            label="Số lượng đã bán"
            name="soldQuantity"
            rules={[{ type: 'number', min: 0, message: 'Số lượng đã bán không được âm' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng đã bán" />
          </Form.Item>

          <Form.Item label="Hình ảnh hiện tại">
            {initialImage ? (
              <Image
                src={initialImage}
                alt="Hình ảnh sản phẩm"
                width={100}
                height={100}
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <span>Không có hình ảnh</span>
            )}
          </Form.Item>

          <Form.Item
            label="Hình ảnh mới"
            name="image"
            rules={[
              {
                validator: (_, value) => {
                  if (value && value.length > 0) {
                    const file = value[0].originFileObj;
                    if (file && !file.type.startsWith('image/')) {
                      return Promise.reject('File tải lên phải là hình ảnh!');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
            getValueFromEvent={(e) => e.fileList} // Lấy fileList từ sự kiện Upload
          >
            <Upload
              listType="picture"
              maxCount={1}
              fileList={fileList} // Sử dụng fileList từ state
              onChange={handleFileChange} // Cập nhật fileList khi người dùng chọn file
              beforeUpload={() => false} // Ngăn upload tự động
              accept="image/*" // Chỉ chấp nhận file hình ảnh
            >
              <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
            </Upload>
          </Form.Item>

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

          <Form.Item style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: 150,
                height: 40,
                borderRadius: 4,
                backgroundColor: '#1a73e8',
                borderColor: '#1a73e8',
              }}
            >
              Cập nhật
            </Button>
            <Button
              style={{ marginLeft: 16, width: 150, height: 40, borderRadius: 4 }}
              onClick={() => navigate('/admin/product')}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default EditProduct;