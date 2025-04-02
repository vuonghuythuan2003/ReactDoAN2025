import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Modal, Tooltip, Spin, Tag, Checkbox } from 'antd';
import { LockOutlined, UnlockOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';
import { fetchUsers, fetchRoles, updateUserRoles, toggleUserStatus, setCurrentPage, setPageSize, setSort, setSelectedUser, setSelectedRoles, clearSelectedUser } from '../../../redux/reducers/UserSlice';

const { Title } = Typography;

const User = () => {
  const dispatch = useDispatch();
  const { users, totalUsers, roles, loading, error, currentPage, pageSize, sortBy, sortDirection, selectedUser, selectedRoles } = useSelector((state) => state.users);
  const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
  const [isRemoveRoleModalVisible, setIsRemoveRoleModalVisible] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // Thêm trạng thái initialLoading

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchUsers({ page: currentPage, size: pageSize, sortBy, direction: sortDirection })),
          dispatch(fetchRoles()),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Không thể tải dữ liệu người dùng!', { position: 'top-right', autoClose: 3000 });
      } finally {
        // Giả lập loading 3 giây
        setTimeout(() => {
          setInitialLoading(false);
        }, 3000);
      }
    };
    fetchInitialData();
  }, [dispatch, currentPage, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 3000 });
    }
  }, [error]);

  const handleTableChange = (pagination, filters, sorter) => {
    dispatch(setCurrentPage(pagination.current));
    dispatch(setPageSize(pagination.pageSize));
    if (sorter.field && sorter.order) {
      dispatch(setSort({ sortBy: sorter.field, sortDirection: sorter.order === 'ascend' ? 'asc' : 'desc' }));
    }
  };

  const showAddRoleModal = (user) => {
    dispatch(setSelectedUser(user));
    setIsAddRoleModalVisible(true);
  };

  const handleRoleChange = (roleId) => {
    const newSelectedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    dispatch(setSelectedRoles(newSelectedRoles));
  };

  const handleAddRoles = () => {
    if (!selectedUser) return;
    const currentRoles = selectedUser.roles ? selectedUser.roles.map(role => role.id) : [];
    const rolesToAdd = selectedRoles.filter(roleId => !currentRoles.includes(roleId));
    const rolesToRemove = currentRoles.filter(roleId => !selectedRoles.includes(roleId));

    dispatch(updateUserRoles({ userId: selectedUser.id, rolesToAdd, rolesToRemove }))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Cập nhật quyền thành công!', { position: 'top-right', autoClose: 3000 });
          setIsAddRoleModalVisible(false);
          dispatch(fetchUsers({ page: currentPage, size: pageSize, sortBy, direction: sortDirection }));
        }
      });
  };

  const showRemoveRoleModal = (user, role) => {
    dispatch(setSelectedUser(user));
    setRoleToRemove(role);
    setIsRemoveRoleModalVisible(true);
  };

  const handleRemoveRole = () => {
    if (!selectedUser || !roleToRemove) return;
    dispatch(updateUserRoles({ userId: selectedUser.id, rolesToAdd: [], rolesToRemove: [roleToRemove.id] }))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Xóa quyền thành công!', { position: 'top-right', autoClose: 3000 });
          setIsRemoveRoleModalVisible(false);
          dispatch(fetchUsers({ page: currentPage, size: pageSize, sortBy, direction: sortDirection }));
        }
      });
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'mở khóa' : 'khóa';
    Modal.confirm({
      title: `Xác nhận ${action} người dùng`,
      content: `Bạn có chắc chắn muốn ${action} người dùng này?`,
      okText: newStatus ? 'Mở khóa' : 'Khóa',
      okType: newStatus ? 'primary' : 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        dispatch(toggleUserStatus({ userId, status: newStatus }))
          .then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
              toast.success(`Người dùng đã được ${action} thành công!`, { position: 'top-right', autoClose: 3000 });
            }
          });
      },
      onCancel: () => {
        toast.info(`Hủy ${action} người dùng.`, { position: 'top-right', autoClose: 2000 });
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const columns = [
    { title: 'STT', key: 'index', render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, width: '5%', align: 'center' },
    { title: 'Tên người dùng', dataIndex: 'username', key: 'username', sorter: true, width: '15%', align: 'center' },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: true, width: '20%', align: 'center' },
    { title: 'Họ tên', dataIndex: 'fullname', key: 'fullname', sorter: true, width: '15%', align: 'center' },
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
                <Button type="link" icon={<DeleteOutlined />} onClick={() => showRemoveRoleModal(record, role)} danger />
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
      render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Hoạt động' : 'Bị khóa'}</Tag>,
      width: '10%',
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: formatDate,
      sorter: true,
      width: '15%',
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Thêm quyền">
            <Button className="addRoleButton" icon={<PlusOutlined />} onClick={() => showAddRoleModal(record)} />
          </Tooltip>
          <Tooltip title={record.status ? 'Khóa người dùng' : 'Mở khóa người dùng'}>
            <Button
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
          .lockButton { background: #fff1f0; border-color: #f5222d; color: #f5222d; transition: all 0.3s ease; }
          .lockButton:hover { background: #f5222d; color: #fff; border-color: #f5222d; transform: scale(1.05); }
          .unlockButton { background: #e6ffed; border-color: #52c41a; color: #52c41a; transition: all 0.3s ease; }
          .unlockButton:hover { background: #52c41a; color: #fff; border-color: #52c41a; transform: scale(1.05); }
          .addRoleButton { background: #e6f7ff; border-color: #1a73e8; color: #1a73e8; transition: all 0.3s ease; }
          .addRoleButton:hover { background: #1a73e8; color: #fff; border-color: #1a73e8; transform: scale(1.05); }
          .modalContent { background: #f0f7ff; border-radius: 8px; padding: 16px; }
          .modalContent .ant-checkbox-wrapper { margin: 8px 0; }
          .Toastify__toast--success { background: #e6f7ff !important; color: #1a73e8 !important; font-weight: 500; }
          .Toastify__toast--error { background: #fff1f0 !important; color: #f5222d !important; font-weight: 500; }
          .Toastify__toast--info { background: #f0f2f5 !important; color: #595959 !important; font-weight: 500; }
          .ant-table-placeholder { background: #f9fbff; color: #595959; font-style: italic; }
        `}
      </style>

      <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
          Quản lý người dùng
        </Title>
        <Spin spinning={initialLoading || loading} tip="Đang tải dữ liệu..." size="large">
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
            locale={{ emptyText: 'Không có dữ liệu người dùng để hiển thị.' }}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalUsers,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20'],
              showTotal: (total) => `Tổng ${total} người dùng`,
              onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            rowClassName={() => 'table-row'}
          />
        </Spin>

        <Modal
          title={`Thêm quyền cho người dùng: ${selectedUser?.username}`}
          open={isAddRoleModalVisible}
          onOk={handleAddRoles}
          onCancel={() => {
            setIsAddRoleModalVisible(false);
            dispatch(clearSelectedUser());
          }}
          okText="Cập nhật"
          cancelText="Hủy"
          okButtonProps={{ className: 'submitButton' }}
          cancelButtonProps={{ className: 'cancelButton' }}
        >
          <div className="modalContent">
            <p>
              <strong>Quyền hiện tại:</strong>{' '}
              {selectedUser?.roles?.length > 0 ? selectedUser.roles.map(role => role.roleType).join(', ') : 'Không có quyền'}
            </p>
            <p><strong>Chọn quyền:</strong></p>
            <Space direction="vertical">
              {roles.map(role => (
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

        <Modal
          title="Xác nhận xóa quyền"
          open={isRemoveRoleModalVisible}
          onOk={handleRemoveRole}
          onCancel={() => {
            setIsRemoveRoleModalVisible(false);
            dispatch(clearSelectedUser());
          }}
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