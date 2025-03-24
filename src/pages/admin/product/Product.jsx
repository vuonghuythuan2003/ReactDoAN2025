import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Spin, Descriptions } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Image } from 'antd';

const { Title } = Typography;

const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalVisible, setIsModalVisible] = useState(false); // State để quản lý modal
  const [selectedProduct, setSelectedProduct] = useState(null); // State để lưu chi tiết sản phẩm

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();

      try {
        const categoryResponse = await axios.get('http://localhost:8080/api/v1/admin/categories');
        const categoryData = categoryResponse.data.content || categoryResponse.data;

        if (!Array.isArray(categoryData)) {
          throw new Error('Dữ liệu danh mục trả về không đúng định dạng (không phải mảng).');
        }
        setCategories(categoryData);

        const productResponse = await axios.get('http://localhost:8080/api/v1/admin/products');
        const productData = productResponse.data.content || productResponse.data;

        if (!Array.isArray(productData)) {
          throw new Error('Dữ liệu sản phẩm trả về không đúng định dạng (không phải mảng).');
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = 4000 - elapsedTime;

        setTimeout(() => {
          setProducts(productData);
          setLoading(false);
        }, remainingTime > 0 ? remainingTime : 0);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        let errorMessage = 'Không thể lấy dữ liệu!';
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
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        const elapsedTime = Date.now() - startTime;
        const remainingTime = 4000 - elapsedTime;
        setTimeout(() => {
          setLoading(false);
        }, remainingTime > 0 ? remainingTime : 0);
      }
    };
    fetchData();
  }, []);

  // Hàm lấy chi tiết sản phẩm
  const fetchProductDetail = async (productId) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/admin/products/${productId}`);
      const data = response.data;

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;

      setTimeout(() => {
        setSelectedProduct(data);
        setIsModalVisible(true);
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      let errorMessage = 'Không thể lấy chi tiết sản phẩm!';
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

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;
      setTimeout(() => {
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  // Xử lý xem chi tiết sản phẩm
  const handleViewDetail = (record) => {
    fetchProductDetail(record.productId);
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleDelete = (productId, productName) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axios.delete(`http://localhost:8080/api/v1/admin/products/${productId}`);
          setProducts(products.filter((product) => product.productId !== productId));
          toast.success(response.data || `Xóa sản phẩm "${productName}" thành công!`, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setCurrentPage(1);
        } catch (error) {
          console.error('Lỗi khi xóa sản phẩm:', error);
          let errorMessage = 'Xóa sản phẩm thất bại! Vui lòng thử lại.';
          
          if (error.response) {
            console.log('Error response data:', error.response.data);
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
            if (error.response.status === 400) {
              errorMessage = errorMessage || 'Không thể xóa sản phẩm do lỗi dữ liệu.';
            } else if (error.response.status === 404) {
              errorMessage = 'Sản phẩm không tồn tại.';
            } else if (error.response.status === 500) {
              errorMessage = errorMessage || 'Lỗi server. Vui lòng thử lại sau.';
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          console.log('Error message to display:', errorMessage);
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
        toast.info('Hủy xóa sản phẩm.', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      },
    });
  };

  // Định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => startIndex + index + 1,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      width: '15%',
      align: 'center',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      align: 'center',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        image ? (
          <Image
            src={image}
            alt="Hình ảnh sản phẩm"
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={true}
          />
        ) : (
          <span>Không có hình ảnh</span>
        )
      ),
      width: '8%',
      align: 'center',
    },
    {
      title: 'Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (unitPrice) => formatCurrency(unitPrice),
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      width: '10%',
      align: 'center',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      width: '8%',
      align: 'center',
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldQuantity',
      key: 'soldQuantity',
      sorter: (a, b) => a.soldQuantity - b.soldQuantity,
      width: '8%',
      align: 'center',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => {
        const category = categories.find((cat) => cat.categoryId === categoryId);
        return category ? category.categoryName : 'N/A';
      },
      width: '8%',
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => formatDate(createdAt),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: '10%',
      align: 'center',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => formatDate(updatedAt),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      width: '10%',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết sản phẩm">
            <Button
              type="default"
              className="viewButton"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa sản phẩm">
            <Button
              type="default"
              className="editButton"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/edit/product/${record.productId}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa sản phẩm">
            <Button
              type="default"
              className="deleteButton"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.productId, record.productName)}
            />
          </Tooltip>
        </Space>
      ),
      width: '10%',
      align: 'center',
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = products.slice(startIndex, endIndex);

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
          Danh sách sản phẩm
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
                Tổng số sản phẩm: {products.length}
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/add/product')}
                style={{
                  borderRadius: 4,
                  backgroundColor: '#1a73e8',
                  borderColor: '#1a73e8',
                  height: 40,
                  fontWeight: 500,
                }}
              >
                Thêm sản phẩm mới
              </Button>
            </div>
            <Table
              className="tableContainer"
              columns={columns}
              dataSource={paginatedData}
              rowKey="productId"
              locale={{
                emptyText: 'Không có dữ liệu sản phẩm để hiển thị.',
              }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: products.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} sản phẩm`,
                onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
              }}
              style={{ borderRadius: 8 }}
              scroll={{ x: 'max-content' }}
              rowClassName={() => 'table-row'}
            />
          </Spin>
        </Card>

        {/* Modal hiển thị chi tiết sản phẩm */}
        <Modal
          title="Chi tiết sản phẩm"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedProduct && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID sản phẩm">{selectedProduct.productId}</Descriptions.Item>
              <Descriptions.Item label="Tên sản phẩm">{selectedProduct.productName}</Descriptions.Item>
              <Descriptions.Item label="SKU">{selectedProduct.sku}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{selectedProduct.description}</Descriptions.Item>
              <Descriptions.Item label="Hình ảnh">
                {selectedProduct.image ? (
                  <Image
                    src={selectedProduct.image}
                    alt="Hình ảnh sản phẩm"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    preview={true}
                  />
                ) : (
                  <span>Không có hình ảnh</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giá">{formatCurrency(selectedProduct.unitPrice)}</Descriptions.Item>
              <Descriptions.Item label="Tồn kho">{selectedProduct.stockQuantity}</Descriptions.Item>
              <Descriptions.Item label="Đã bán">{selectedProduct.soldQuantity}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {categories.find((cat) => cat.categoryId === selectedProduct.categoryId)?.categoryName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{formatDate(selectedProduct.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">{formatDate(selectedProduct.updatedAt)}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Product;