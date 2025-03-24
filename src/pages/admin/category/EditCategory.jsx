import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { EditOutlined } from '@ant-design/icons';
import '../category/css/Editcate.scss';

const { Title } = Typography;

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/admin/categories/${id}`);
        const category = response.data;
        form.setFieldsValue({
          categoryName: category.categoryName,
          description: category.description,
          status: category.status,
        });
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin danh mục:', error);
        toast.error('Không thể lấy thông tin danh mục!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, form]);

  // Xử lý khi submit form
  const onFinish = async (values) => {
    try {
      await axios.put(`http://localhost:8080/api/v1/admin/categories/${id}`, values);
      toast.success('Cập nhật danh mục thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        navigate('/admin/category');
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      toast.error('Cập nhật danh mục thất bại!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="pageContainer" style={{ padding: '40px', minHeight: '100vh' }}>
      <div className="titleContainer">
        <EditOutlined style={{ fontSize: '32px', color: '#1a73e8' }} />
        <Title level={2}>Chỉnh sửa danh mục</Title>
      </div>
      <Card
        className="cardContainer"
        style={{
          maxWidth: 600,
          margin: '0 auto',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        styles={{ body: { padding: '30px' } }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Typography.Text>Đang tải dữ liệu...</Typography.Text>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              categoryName: '',
              description: '',
              status: true,
            }}
          >
            <Form.Item
              name="categoryName"
              label="Tên danh mục"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
            >
              <Input
                placeholder="Nhập tên danh mục"
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả danh mục"
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Hoạt động"
                unCheckedChildren="Không hoạt động"
                defaultChecked
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="buttonPrimary"
                  style={{
                    borderRadius: 4,
                    height: 40,
                    fontWeight: 500,
                    backgroundColor: '#1a73e8',
                    borderColor: '#1a73e8',
                  }}
                >
                  Cập nhật danh mục
                </Button>
                <Button
                  className="buttonSecondary"
                  style={{
                    borderRadius: 4,
                    height: 40,
                    fontWeight: 500,
                  }}
                  onClick={() => navigate('/admin/category')}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EditCategory;