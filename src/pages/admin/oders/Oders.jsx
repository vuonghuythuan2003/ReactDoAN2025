import React, { useEffect, useState } from 'react'; 
import { useSelector, useDispatch } from 'react-redux';
import { Table, Input, Select, Button, Typography, Spin, Space, Tag, Modal, Card, Descriptions } from 'antd';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SearchOutlined } from '@ant-design/icons';
import { fetchAllOrders, fetchOrdersByStatus, fetchOrderDetail, updateOrderStatus, setCurrentPage, setPageSize, setSearchText, setStatusFilter, clearSelectedOrder } from '../../../redux/reducers/OrderSlice';

const { Title } = Typography;
const { Option } = Select;

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, filteredOrders, selectedOrder, loading, error, currentPage, pageSize, searchText, statusFilter } = useSelector((state) => state.orders);
  const [initialLoading, setInitialLoading] = useState(true); // Thêm trạng thái initialLoading
  const statusOptions = ['WAITING', 'CONFIRM', 'DELIVERY', 'SUCCESS', 'CANCEL'];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchAllOrders());
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Không thể tải danh sách đơn hàng!', { position: 'top-right', autoClose: 3000 });
      } finally {
        // Giả lập loading 3 giây
        setTimeout(() => {
          setInitialLoading(false);
        }, 3000);
      }
    };
    fetchInitialData();
  }, [dispatch]);

  // Hiển thị thông báo lỗi từ Redux
  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 3000 });
    }
  }, [error]);

  // Xử lý khi statusFilter thay đổi
  useEffect(() => {
    if (statusFilter) {
      dispatch(fetchOrdersByStatus(statusFilter));
    } else {
      dispatch(fetchAllOrders());
    }
  }, [statusFilter, dispatch]);

  const handleSearch = (value) => {
    dispatch(setSearchText(value));
  };

  const handleStatusFilter = (value) => {
    dispatch(setStatusFilter(value));
  };

  const handleViewDetail = (record) => {
    dispatch(fetchOrderDetail(record.orderId)).then(() => {
      setTimeout(() => {}, 4000); // Giữ hiệu ứng loading giống bản gốc
    });
  };

  const handleModalClose = () => {
    dispatch(clearSelectedOrder());
  };

  const handleTableChange = (pagination) => {
    dispatch(setCurrentPage(pagination.current));
    dispatch(setPageSize(pagination.pageSize));
  };

  const updateOrderStatusHandler = (orderId, newStatus) => {
    dispatch(updateOrderStatus({ orderId, status: newStatus })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Cập nhật trạng thái thành công!', { position: 'top-right', autoClose: 3000 });
      }
    });
  };

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
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
          onChange={(newStatus) => updateOrderStatusHandler(record.orderId, newStatus)}
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
      render: (_, record) => (
        <Space size="middle">
          <Button type="default" className="viewButton" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
      width: '10%',
      align: 'center',
    },
  ];

  const paginatedData = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <style>
        {`
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
            0% { opacity: 0; transform: translateX(-20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
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
          .ant-pagination-item {
            border-radius: 4px;
            border: 1px solid #e6f0fa;
          }
          .ant-pagination-item a { color: #1a73e8; }
          .ant-pagination-item:hover { border-color: #1a73e8; }
          .ant-pagination-item:hover a { color: #1557b0; }
          .ant-pagination-item-active { background: #1a73e8; border-color: #1a73e8; }
          .ant-pagination-item-active a { color: #fff; }
          .ant-pagination-prev, .ant-pagination-next {
            border-radius: 4px;
            border: 1px solid #e6f0fa;
            color: #1a73e8;
          }
          .ant-pagination-prev:hover, .ant-pagination-next:hover {
            border-color: #1a73e8;
            color: #1557b0;
          }
          .ant-spin-dot-item { background-color: #1a73e8; }
          .ant-spin-text { color: #1a73e8; font-weight: 500; margin-top: 10px; }
          .viewButton { background: #e6f7ff; border-color: #1a73e8; color: #1a73e8; transition: all 0.3s ease; }
          .viewButton:hover { background: #1a73e8; color: #fff; border-color: #1a73e8; transform: scale(1.05); }
          .Toastify__toast--success { background: #e6f7ff !important; color: #1a73e8 !important; font-weight: 500; }
          .Toastify__toast--error { background: #fff1f0 !important; color: #f5222d !important; font-weight: 500; }
          .Toastify__toast--info { background: #f0f2f5 !important; color: #595959 !important; font-weight: 500; }
          .ant-table-placeholder { background: #f9fbff; color: #595959; font-style: italic; }
          .ant-select-selector { border-radius: 4px !important; }
          .ant-input-search .ant-input { border-radius: 4px 0 0 4px !important; }
          .ant-input-search .ant-btn { border-radius: 0 4px 4px 0 !important; }
        `}
      </style>

      <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
          Quản lý đơn hàng
        </Title>
        <Card style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', background: '#fff' }}>
        <Spin spinning={initialLoading || loading} tip="Đang tải dữ liệu..." size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                Tổng số đơn hàng: {filteredOrders.length}
              </Title>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Input.Search
                  placeholder="Tìm kiếm theo mã đơn hàng, tên người nhận, số điện thoại..."
                  value={searchText}
                  onChange={(e) => dispatch(setSearchText(e.target.value))}
                  onSearch={handleSearch}
                  enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
                  style={{ width: '400px' }}
                />
                <Select
                  placeholder="Lọc theo trạng thái"
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  allowClear
                  style={{ width: '200px' }}
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
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredOrders.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} đơn hàng`,
                onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
              }}
              locale={{ emptyText: 'Không có dữ liệu đơn hàng để hiển thị.' }}
              scroll={{ x: 'max-content' }}
              rowClassName={() => 'table-row'}
            />
          </Spin>
        </Card>

        <Modal
          title="Chi tiết đơn hàng"
          open={!!selectedOrder}
          onCancel={handleModalClose}
          footer={[<Button key="close" onClick={handleModalClose}>Đóng</Button>]}
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