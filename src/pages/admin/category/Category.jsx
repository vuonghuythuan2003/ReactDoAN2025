import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Spin, Descriptions } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;

const Category = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false); // State để quản lý modal
  const [selectedCategory, setSelectedCategory] = useState(null); // State để lưu chi tiết danh mục

  useEffect(() => {
    const fetchCategories = async () => {
      const startTime = Date.now();

      try {
        const response = await axios.get('http://localhost:8080/api/v1/admin/categories');
        const data = response.data.content || response.data;

        if (!Array.isArray(data)) {
          throw new Error('Dữ liệu trả về không đúng định dạng (không phải mảng).');
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = 4000 - elapsedTime;

        setTimeout(() => {
          setCategories(data);
          setLoading(false);
        }, remainingTime > 0 ? remainingTime : 0);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
        let errorMessage = 'Không thể lấy danh sách danh mục!';
        if (error.response) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
          if (error.response.status === 400) {
            errorMessage = errorMessage || 'Yêu cầu không hợp lệ.';
          } else if (error.response.status === 500) {
            errorMessage = errorMessage || 'Lỗi server. Vui lòng thử lại sau.';
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });

        const elapsedTime = Date.now() - startTime;
        const remainingTime = 4000 - elapsedTime;
        setTimeout(() => {
          setLoading(false);
        }, remainingTime > 0 ? remainingTime : 0);
      }
    };
    fetchCategories();
  }, []);

  // Hàm lấy chi tiết danh mục
  const fetchCategoryDetail = async (categoryId) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/admin/categories/${categoryId}`);
      const data = response.data;

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;

      setTimeout(() => {
        setSelectedCategory(data);
        setIsModalVisible(true);
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết danh mục:', error);
      let errorMessage = 'Không thể lấy chi tiết danh mục!';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 404) {
          errorMessage = 'Danh mục không tồn tại.';
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

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;
      setTimeout(() => {
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  // Xử lý xem chi tiết danh mục
  const handleViewDetail = (record) => {
    fetchCategoryDetail(record.categoryId);
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleDelete = (categoryId, categoryName) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      content: `Bạn có chắc chắn muốn xóa danh mục "${categoryName}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axios.delete(`http://localhost:8080/api/v1/admin/categories/${categoryId}`);
          setCategories(categories.filter((category) => category.categoryId !== categoryId));
          toast.success(response.data || `Xóa danh mục "${categoryName}" thành công!`, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setCurrentPage(1);
        } catch (error) {
          console.error('Lỗi khi xóa danh mục:', error);
          let errorMessage = 'Xóa danh mục thất bại! Vui lòng thử lại.';
          
          if (error.response) {
            console.log('Error response data:', error.response.data);
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
          
            if (error.response.status === 400) {
              errorMessage = errorMessage || 'Không thể xóa danh mục do lỗi dữ liệu.';
            } else if (error.response.status === 404) {
              errorMessage = 'Danh mục không tồn tại.';
            } else if (error.response.status === 500) {
              errorMessage = errorMessage || 'Lỗi server. Vui lòng thử lại sau.';
            }
          }
          
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      },
      onCancel: () => {
        toast.info('Hủy xóa danh mục.', {
          position: 'top-right',
          autoClose: 2000,
        });
      },
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => startIndex + index + 1,
      width: '10%',
      align: 'center',
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      sorter: (a, b) => a.categoryName.localeCompare(b.categoryName),
      className: 'custom-sort-column',
      width: '25%',
      align: 'center',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status ? '#52c41a' : '#f5222d' }}>
          {status ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Không hoạt động', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      width: '15%',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết danh mục">
            <Button
              type="default"
              className="viewButton"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa danh mục">
            <Button
              type="default"
              className="editButton"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/edit/category/${record.categoryId}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa danh mục">
            <Button
              type="default"
              className="deleteButton"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.categoryId, record.categoryName)}
            />
          </Tooltip>
        </Space>
      ),
      width: '15%',
      align: 'center',
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = categories.slice(startIndex, endIndex);

  return (
    <>
      <style>
        {`
          /* Hiệu ứng xuất hiện cho hàng trong bảng */
          .table-row {
            opacity: 0;
            transform: translateX(-20px);
            animation: fadeInSlide 0.5s ease forwards;
          }

          .table-row:nth-child(1) { animation-delay: 0.1s; }
          .table-row:nth-child(2) { animation-delay: 0.2s; }
          .table-row:nth-child(3) { animation-delay: 0.3s; }
          .table-row:nth-child(4) { animation-delay: 0.4s; }
          .table-row:nth-child(5) { animation-delay: 0.5s; }
          .table-row:nth-child(n + 6) { animation-delay: 0.6s; }

          .table-row:hover {
            background-color: #e6f7ff !important;
            transition: background-color 0.3s ease;
          }

          @keyframes fadeInSlide {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Style cho bảng */
          .tableContainer {
            background: linear-gradient(135deg, #f9fbff 0%, #e6f0fa 100%);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e6f0fa;
            padding: 8px;
          }

          .tableContainer .ant-table-thead > tr > th {
            background: #1a73e8;
            color: #fff;
            font-weight: 600;
            border-bottom: 2px solid #1557b0;
            text-align: center;
          }

          .tableContainer .ant-table-tbody > tr > td {
            border-bottom: 1px solid #e6f0fa;
            text-align: center;
          }

          .tableContainer .ant-table-tbody > tr:hover > td {
            background: #e6f7ff;
            transition: background 0.3s ease;
          }

          /* Style cho phân trang */
          .ant-pagination-item {
            border-radius: 4px;
            border: 1px solid #e6f0fa;
          }

          .ant-pagination-item a {
            color: #1a73e8;
          }

          .ant-pagination-item:hover {
            border-color: #1a73e8;
          }

          .ant-pagination-item:hover a {
            color: #1557b0;
          }

          .ant-pagination-item-active {
            background: #1a73e8;
            border-color: #1a73e8;
          }

          .ant-pagination-item-active a {
            color: #fff;
          }

          .ant-pagination-prev,
          .ant-pagination-next {
            border-radius: 4px;
            border: 1px solid #e6f0fa;
            color: #1a73e8;
          }

          .ant-pagination-prev:hover,
          .ant-pagination-next:hover {
            border-color: #1a73e8;
            color: #1557b0;
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

          /* Style cho nút Xem chi tiết, Sửa và Xóa */
          .viewButton {
            background: #f0f2f5;
            border-color: #595959;
            color: #595959;
            transition: all 0.3s ease;
          }

          .viewButton:hover {
            background: #595959;
            color: #fff;
            border-color: #595959;
            transform: scale(1.05);
          }

          .editButton {
            background: #e6f7ff;
            border-color: #1a73e8;
            color: #1a73e8;
            transition: all 0.3s ease;
          }

          .editButton:hover {
            background: #1a73e8;
            color: #fff;
            border-color: #1a73e8;
            transform: scale(1.05);
          }

          .deleteButton {
            background: #fff1f0;
            border-color: #f5222d;
            color: #f5222d;
            transition: all 0.3s ease;
          }

          .deleteButton:hover {
            background: #f5222d;
            color: #fff;
            border-color: #f5222d;
            transform: scale(1.05);
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

          .Toastify__toast--info {
            background: #f0f2f5 !important;
            color: #595959 !important;
            font-weight: 500;
          }

          /* Style cho bảng khi không có dữ liệu */
          .ant-table-placeholder {
            background: #f9fbff;
            color: #595959;
            font-style: italic;
          }
        `}
      </style>

      <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
          Danh sách danh mục
        </Title>
        <Card
          style={{
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            background: '#fff',
          }}
          styles={{ body: { padding: '24px' } }}
        >
          <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                Tổng số danh mục: {categories.length}
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/add/category')}
                style={{
                  borderRadius: 4,
                  backgroundColor: '#1a73e8',
                  borderColor: '#1a73e8',
                  height: 40,
                  fontWeight: 500,
                }}
              >
                Thêm danh mục mới
              </Button>
            </div>
            <Table
              className="tableContainer"
              columns={columns}
              dataSource={paginatedData}
              rowKey="categoryId"
              locale={{
                emptyText: 'Không có dữ liệu danh mục để hiển thị.',
              }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: categories.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} danh mục`,
                onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
              }}
              style={{ borderRadius: 8 }}
              scroll={{ x: 'max-content' }}
              rowClassName={() => 'table-row'}
            />
          </Spin>
        </Card>

        {/* Modal hiển thị chi tiết danh mục */}
        <Modal
          title="Chi tiết danh mục"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
          width={600}
        >
          {selectedCategory && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID danh mục">{selectedCategory.categoryId}</Descriptions.Item>
              <Descriptions.Item label="Tên danh mục">{selectedCategory.categoryName}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{selectedCategory.description}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span style={{ color: selectedCategory.status ? '#52c41a' : '#f5222d' }}>
                  {selectedCategory.status ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Category;