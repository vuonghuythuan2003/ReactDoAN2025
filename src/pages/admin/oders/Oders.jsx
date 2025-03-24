import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Button, Typography, Spin, Space, Tag, Modal, Card, Descriptions } from 'antd';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // Danh sách đơn hàng sau khi lọc/tìm kiếm
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null); // Mặc định là null để hiển thị tất cả
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Danh sách trạng thái có thể chọn
  const statusOptions = ['WAITING', 'CONFIRM', 'DELIVERY', 'SUCCESS', 'CANCEL'];

  // Lấy danh sách tất cả đơn hàng từ API
  const fetchAllOrders = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const response = await axios.get('http://localhost:8080/api/v1/admin/orders');
      const data = response.data.content || response.data;

      console.log('Dữ liệu từ fetchAllOrders:', data); // Debug

      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu đơn hàng trả về không đúng định dạng (không phải mảng).');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;

      // Trì hoãn hiển thị dữ liệu để tạo hiệu ứng loading
      setTimeout(() => {
        setOrders(data);
        setFilteredOrders(data); // Hiển thị tất cả đơn hàng ban đầu
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      let errorMessage = 'Không thể lấy danh sách đơn hàng!';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập!';
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

      // Trì hoãn hiển thị thông báo lỗi và tắt loading
      setTimeout(() => {
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  // Lấy danh sách đơn hàng theo trạng thái
  const fetchOrdersByStatus = async (status) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/admin/orders/status/${status}`);
      const data = response.data.content || response.data;

      console.log(`Dữ liệu từ fetchOrdersByStatus (${status}):`, data); // Debug

      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu đơn hàng trả về không đúng định dạng (không phải mảng).');
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;

      // Trì hoãn hiển thị dữ liệu để tạo hiệu ứng loading
      setTimeout(() => {
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng theo trạng thái:', error);
      let errorMessage = `Không thể lấy danh sách đơn hàng với trạng thái ${status}!`;
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập!';
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

      // Trì hoãn hiển thị thông báo lỗi và tắt loading
      setTimeout(() => {
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetail = async (orderId) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/admin/orders/${orderId}`);
      const data = response.data;

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 4000 - elapsedTime;

      // Trì hoãn hiển thị chi tiết đơn hàng để tạo hiệu ứng loading
      setTimeout(() => {
        setSelectedOrder(data);
        setIsModalVisible(true);
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      let errorMessage = 'Không thể lấy chi tiết đơn hàng!';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 404) {
          errorMessage = 'Đơn hàng không tồn tại.';
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

      // Trì hoãn tắt loading
      setTimeout(() => {
        setLoading(false);
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:8080/api/v1/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedOrder = response.data;
      const updatedOrders = orders.map((order) =>
        order.orderId === updatedOrder.orderId ? updatedOrder : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);

      toast.success('Cập nhật trạng thái thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      let errorMessage = 'Không thể cập nhật trạng thái đơn hàng!';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền cập nhật trạng thái!';
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
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được mount
  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Xử lý khi statusFilter thay đổi
  useEffect(() => {
    if (statusFilter) {
      fetchOrdersByStatus(statusFilter);
    } else {
      fetchAllOrders();
    }
  }, [statusFilter]);

  // Xử lý tìm kiếm cục bộ
  useEffect(() => {
    let result = [...orders];

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (order) =>
          order.serialNumber.toLowerCase().includes(lowerSearchText) ||
          order.receiveName.toLowerCase().includes(lowerSearchText) ||
          order.receivePhone.toLowerCase().includes(lowerSearchText)
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [searchText, orders]);

  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Xử lý lọc theo trạng thái
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  // Xử lý xem chi tiết đơn hàng
  const handleViewDetail = (record) => {
    fetchOrderDetail(record.orderId);
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  // Định dạng trạng thái
  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case 'DELIVERY':
        color = 'blue';
        break;
      case 'SUCCESS':
        color = 'green';
        break;
      case 'CANCEL':
        color = 'red';
        break;
      case 'CONFIRM':
        color = 'orange';
        break;
      case 'WAITING':
        color = 'purple';
        break;
      default:
        color = 'default';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
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

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Tên người nhận',
      dataIndex: 'receiveName',
      key: 'receiveName',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'receiveAddress',
      key: 'receiveAddress',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'receivePhone',
      key: 'receivePhone',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value) => formatCurrency(value),
      width: '10%',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          style={{ width: '120px' }}
          value={status}
          onChange={(newStatus) => updateOrderStatus(record.orderId, newStatus)}
          disabled={loading}
        >
          {statusOptions.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      ),
      width: '10%',
      align: 'center',
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      width: '15%',
      align: 'center',
    },
    {
      title: 'Ngày nhận hàng',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      render: (date) => formatDate(date),
      width: '15%',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="default"
            className="viewButton"
            onClick={() => handleViewDetail(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
      width: '10%',
      align: 'center',
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredOrders.slice(startIndex, endIndex);

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

          /* Style cho nút Xem chi tiết */
          .viewButton {
            background: #e6f7ff;
            border-color: #1a73e8;
            color: #1a73e8;
            transition: all 0.3s ease;
          }

          .viewButton:hover {
            background: #1a73e8;
            color: #fff;
            border-color: #1a73e8;
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
          Quản lý đơn hàng
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
                Tổng số đơn hàng: {filteredOrders.length}
              </Title>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Input.Search
                  placeholder="Tìm kiếm theo mã đơn hàng, tên người nhận, số điện thoại..."
                  onSearch={handleSearch}
                  enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
                  style={{ width: '400px' }}
                />
                <Select
                  placeholder="Lọc theo trạng thái"
                  style={{ width: '200px' }}
                  onChange={handleStatusFilter}
                  allowClear
                >
                  <Option value="WAITING">Chờ xác nhận</Option>
                  <Option value="CONFIRM">Chờ xử lý</Option>
                  <Option value="DELIVERY">Đang giao</Option>
                  <Option value="SUCCESS">Hoàn thành</Option>
                  <Option value="CANCEL">Đã hủy</Option>
                </Select>
              </div>
            </div>
            <Table
              className="tableContainer"
              columns={columns}
              dataSource={paginatedData}
              rowKey="orderId"
              locale={{
                emptyText: 'Không có dữ liệu đơn hàng để hiển thị.',
              }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredOrders.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} đơn hàng`,
                onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
              }}
              style={{ borderRadius: 8 }}
              scroll={{ x: 'max-content' }}
              rowClassName={() => 'table-row'}
            />
          </Spin>
        </Card>

        {/* Modal hiển thị chi tiết đơn hàng */}
        <Modal
          title="Chi tiết đơn hàng"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedOrder && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã đơn hàng">{selectedOrder.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="ID đơn hàng">{selectedOrder.orderId}</Descriptions.Item>
              <Descriptions.Item label="ID người dùng">{selectedOrder.userId}</Descriptions.Item>
              <Descriptions.Item label="Tên người nhận">{selectedOrder.receiveName}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ nhận">{selectedOrder.receiveAddress}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedOrder.receivePhone}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">{formatCurrency(selectedOrder.totalPrice)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedOrder.note || 'Không có ghi chú'}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng">{formatDate(selectedOrder.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhận hàng">{formatDate(selectedOrder.receivedAt)}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Orders;