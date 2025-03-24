import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Tooltip, Spin, Tag, Checkbox } from 'antd';
import axios from 'axios';
import { LockOutlined, UnlockOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;

const User = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // Add state for total users
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
  const [isRemoveRoleModalVisible, setIsRemoveRoleModalVisible] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState(null);

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      setLoading(true);

      try {
        // Fetch users
        const userResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
          params: {
            page: currentPage - 1,
            size: pageSize,
            sortBy: sortBy,
            direction: sortDirection,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const userData = userResponse.data.content || userResponse.data;
        console.log('User Data:', userData); // Debug the API response
        if (!Array.isArray(userData)) {
          throw new Error('Dữ liệu người dùng trả về không đúng định dạng (không phải mảng).');
        }
        setTotalUsers(userResponse.data.totalElements || userData.length);

        // Fetch roles
        const roleResponse = await axios.get('http://localhost:8080/api/v1/admin/roles', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const roleData = roleResponse.data;
        if (!Array.isArray(roleData)) {
          throw new Error('Dữ liệu vai trò trả về không đúng định dạng (không phải mảng).');
        }
        setRoles(roleData);

        const elapsedTime = Date.now() - startTime;
        const remainingTime = 4000 - elapsedTime;

        setTimeout(() => {
          setUsers(userData);
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
  }, [currentPage, pageSize, sortBy, sortDirection]);

  // Handle table change (pagination and sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);

    if (sorter.field && sorter.order) {
      setSortBy(sorter.field);
      setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  // Open "Thêm quyền" modal
  const showAddRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles ? user.roles.map((role) => role.id) : []);
    setIsAddRoleModalVisible(true);
  };

  // Handle role selection in "Thêm quyền" modal
  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  // Add roles to user
  const handleAddRoles = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const currentRoles = selectedUser.roles ? selectedUser.roles.map((role) => role.id) : [];
      const rolesToAdd = selectedRoles.filter((roleId) => !currentRoles.includes(roleId));
      const rolesToRemove = currentRoles.filter((roleId) => !selectedRoles.includes(roleId));

      // Add new roles
      for (const roleId of rolesToAdd) {
        await axios.put(
          `http://localhost:8080/api/v1/admin/users/${selectedUser.id}/role/${roleId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }

      // Remove roles
      for (const roleId of rolesToRemove) {
        await axios.delete(
          `http://localhost:8080/api/v1/admin/users/${selectedUser.id}/role/${roleId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }

      // Refresh the user list
      const userResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
        params: {
          page: currentPage - 1,
          size: pageSize,
          sortBy: sortBy,
          direction: sortDirection,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const userData = userResponse.data.content || userResponse.data;
      if (!Array.isArray(userData)) {
        throw new Error('Dữ liệu người dùng trả về không đúng định dạng (không phải mảng).');
      }
      setUsers(userData);

      toast.success('Cập nhật quyền thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsAddRoleModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền:', error);
      let errorMessage = 'Cập nhật quyền thất bại! Vui lòng thử lại.';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 400) {
          errorMessage = errorMessage || 'Yêu cầu không hợp lệ.';
        } else if (error.response.status === 404) {
          errorMessage = 'Người dùng hoặc quyền không tồn tại.';
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

  // Open "Xóa quyền" modal
  const showRemoveRoleModal = (user, role) => {
    setSelectedUser(user);
    setRoleToRemove(role);
    setIsRemoveRoleModalVisible(true);
  };

  // Remove a role from a user
  const handleRemoveRole = async () => {
    if (!selectedUser || !roleToRemove) return;

    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/admin/users/${selectedUser.id}/role/${roleToRemove.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Refresh the user list
      const userResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
        params: {
          page: currentPage - 1,
          size: pageSize,
          sortBy: sortBy,
          direction: sortDirection,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const userData = userResponse.data.content || userResponse.data;
      if (!Array.isArray(userData)) {
        throw new Error('Dữ liệu người dùng trả về không đúng định dạng (không phải mảng).');
      }
      setUsers(userData);

      toast.success('Xóa quyền thành công!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsRemoveRoleModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi xóa quyền:', error);
      let errorMessage = 'Xóa quyền thất bại! Vui lòng thử lại.';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.status === 400) {
          errorMessage = errorMessage || 'Yêu cầu không hợp lệ.';
        } else if (error.response.status === 404) {
          errorMessage = 'Người dùng hoặc quyền không tồn tại.';
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

  // Toggle user status (lock/unlock)
  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'mở khóa' : 'khóa';
    Modal.confirm({
      title: `Xác nhận ${action} người dùng`,
      content: `Bạn có chắc chắn muốn ${action} người dùng này?`,
      okText: newStatus ? 'Mở khóa' : 'Khóa',
      okType: newStatus ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axios.put(
            `http://localhost:8080/api/v1/admin/users/${userId}`,
            {},
            {
              params: { status: newStatus },
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          toast.success(response.data || `Người dùng đã được ${action} thành công!`, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Refresh the user list
          const userResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
            params: {
              page: currentPage - 1,
              size: pageSize,
              sortBy: sortBy,
              direction: sortDirection,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          const userData = userResponse.data.content || userResponse.data;
          if (!Array.isArray(userData)) {
            throw new Error('Dữ liệu người dùng trả về không đúng định dạng (không phải mảng).');
          }
          setUsers(userData);
        } catch (error) {
          console.error(`Lỗi khi ${action} người dùng:`, error);
          let errorMessage = `Không thể ${action} người dùng! Vui lòng thử lại.`;
          if (error.response) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data?.message) {
              errorMessage = error.response.data.message;
            }
            if (error.response.status === 400) {
              errorMessage = errorMessage || `Yêu cầu ${action} không hợp lệ.`;
            } else if (error.response.status === 404) {
              errorMessage = 'Người dùng không tồn tại.';
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
        }
      },
      onCancel: () => {
        toast.info(`Hủy ${action} người dùng.`, {
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

  // Format date
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

  // Table columns
  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      width: '15%',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      width: '20%',
      align: 'center',
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullname',
      key: 'fullname',
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      width: '15%',
      align: 'center',
    },
    {
      title: 'Quyền',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles, record) => (
        <Space>
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <Tag key={role.id} color="blue">
                {role.roleType}{' '}
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  onClick={() => showRemoveRoleModal(record, role)}
                  danger
                />
              </Tag>
            ))
          ) : (
            <span style={{ color: '#f5222d' }}>Không có quyền</span>
          )}
        </Space>
      ),
      width: '20%',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>{status ? 'Hoạt động' : 'Bị khóa'}</Tag>
      ),
      width: '10%',
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => formatDate(createdAt),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: '15%',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Thêm quyền">
            <Button
              type="default"
              className="addRoleButton"
              icon={<PlusOutlined />}
              onClick={() => showAddRoleModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.status ? 'Khóa người dùng' : 'Mở khóa người dùng'}>
            <Button
              type="default"
              className={record.status ? 'lockButton' : 'unlockButton'}
              icon={record.status ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record.id, record.status)}
            />
          </Tooltip>
        </Space>
      ),
      width: '10%',
      align: 'center',
    },
  ];

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

          /* Style cho nút Khóa và Mở khóa */
          .lockButton {
            background: #fff1f0;
            border-color: #f5222d;
            color: #f5222d;
            transition: all 0.3s ease;
          }

          .lockButton:hover {
            background: #f5222d;
            color: #fff;
            border-color: #f5222d;
            transform: scale(1.05);
          }

          .unlockButton {
            background: #e6ffed;
            border-color: #52c41a;
            color: #52c41a;
            transition: all 0.3s ease;
          }

          .unlockButton:hover {
            background: #52c41a;
            color: #fff;
            border-color: #52c41a;
            transform: scale(1.05);
          }

          /* Style cho nút Thêm quyền */
          .addRoleButton {
            background: #e6f7ff;
            border-color: #1a73e8;
            color: #1a73e8;
            transition: all 0.3s ease;
          }

          .addRoleButton:hover {
            background: #1a73e8;
            color: #fff;
            border-color: #1a73e8;
            transform: scale(1.05);
          }

          /* Style cho modal */
          .modalContent {
            background: #f0f7ff;
            border-radius: 8px;
            padding: 16px;
          }

          .modalContent .ant-checkbox-wrapper {
            margin: 8px 0;
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
          Quản lý người dùng
        </Title>
        <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: '#333' }}>
              Tổng số người dùng: {totalUsers}
            </Title>
          </div>
          <Table
            className="tableContainer"
            columns={columns}
            dataSource={users}
            rowKey="id"
            locale={{
              emptyText: 'Không có dữ liệu người dùng để hiển thị.',
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalUsers,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total) => `Tổng ${total} người dùng`,
              onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            }}
            onChange={handleTableChange}
            style={{ borderRadius: 8 }}
            scroll={{ x: 'max-content' }}
            rowClassName={() => 'table-row'}
          />
        </Spin>

        {/* Modal for adding roles */}
        <Modal
          title={`Thêm quyền cho người dùng: ${selectedUser?.username}`}
          open={isAddRoleModalVisible}
          onOk={handleAddRoles}
          onCancel={() => setIsAddRoleModalVisible(false)}
          okText="Cập nhật"
          cancelText="Hủy"
          okButtonProps={{ className: 'submitButton' }}
          cancelButtonProps={{ className: 'cancelButton' }}
        >
          <div className="modalContent">
            <p>
              <strong>Quyền hiện tại:</strong>{' '}
              {selectedUser?.roles && selectedUser.roles.length > 0
                ? selectedUser.roles.map((role) => role.roleType).join(', ')
                : 'Không có quyền'}
            </p>
            <p><strong>Chọn quyền:</strong></p>
            <Space direction="vertical">
              {roles.map((role) => (
                <Checkbox
                  key={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleChange(role.id)}
                >
                  {role.roleType}
                </Checkbox>
              ))}
            </Space>
          </div>
        </Modal>

        {/* Modal for removing a role */}
        <Modal
          title="Xác nhận xóa quyền"
          open={isRemoveRoleModalVisible}
          onOk={handleRemoveRole}
          onCancel={() => setIsRemoveRoleModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true, className: 'submitButton' }}
          cancelButtonProps={{ className: 'cancelButton' }}
        >
          <div className="modalContent">
            <p>
              Bạn có chắc chắn muốn xóa quyền <strong>{roleToRemove?.roleType}</strong> của người dùng{' '}
              <strong>{selectedUser?.username}</strong> không?
            </p>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default User;