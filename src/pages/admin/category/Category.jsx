import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Spin, Descriptions, Form, Input, Switch, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchCategories, fetchCategoryDetail, addCategory, updateCategory, deleteCategory, setCurrentPage, setPageSize, setSearchText, clearSelectedCategory } from '../../../redux/reducers/CategorySlice';

const { Title } = Typography;

const Category = () => {
  const dispatch = useDispatch();
  const { categories, filteredCategories, selectedCategory, loading, error, currentPage, pageSize, searchText } = useSelector((state) => state.categories);
  const [initialLoading, setInitialLoading] = useState(true); // Thêm trạng thái initialLoading
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal chi tiết danh mục
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // Modal thêm danh mục
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Modal chỉnh sửa danh mục
  const [form] = Form.useForm(); // Form để thêm danh mục
  const [editForm] = Form.useForm(); // Form để chỉnh sửa danh mục

  // Lấy danh sách danh mục khi component mount
    // Lấy danh sách danh mục khi component mount
    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          await dispatch(fetchCategories());
        } catch (error) {
          console.error('Error fetching categories:', error);
          toast.error('Không thể tải danh sách danh mục!', { position: 'top-right', autoClose: 3000 });
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

  // Xử lý xem chi tiết danh mục
  const handleViewDetail = (record) => {
    dispatch(fetchCategoryDetail(record.categoryId)).then(() => {
      setIsModalVisible(true);
    });
  };

  // Đóng modal chi tiết
  const handleModalClose = () => {
    setIsModalVisible(false);
    dispatch(clearSelectedCategory());
  };

  // Mở modal thêm danh mục
  const handleAddModalOpen = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  // Đóng modal thêm danh mục
  const handleAddModalClose = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  // Mở modal chỉnh sửa danh mục
  const handleEditModalOpen = (record) => {
    dispatch(fetchCategoryDetail(record.categoryId)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        editForm.setFieldsValue({
          categoryName: result.payload.categoryName,
          description: result.payload.description,
          status: result.payload.status,
        });
        setIsEditModalVisible(true);
      }
    });
  };

  // Đóng modal chỉnh sửa danh mục
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    dispatch(clearSelectedCategory());
  };

  // Xử lý thêm danh mục
  const onAddFinish = (values) => {
    dispatch(addCategory(values)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Thêm danh mục thành công!', { position: 'top-right', autoClose: 3000 });
        handleAddModalClose();
      }
    });
  };

  // Xử lý chỉnh sửa danh mục
  const onEditFinish = (values) => {
    dispatch(updateCategory({ categoryId: selectedCategory.categoryId, categoryData: values })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Cập nhật danh mục thành công!', { position: 'top-right', autoClose: 3000 });
        handleEditModalClose();
      }
    });
  };

  // Xử lý xóa danh mục
  const handleDelete = (categoryId, categoryName) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      content: `Bạn có chắc chắn muốn xóa danh mục "${categoryName}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        dispatch(deleteCategory(categoryId)).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            toast.success(`Xóa danh mục "${categoryName}" thành công!`, { position: 'top-right', autoClose: 3000 });
            dispatch(setCurrentPage(1));
          }
        });
      },
      onCancel: () => {
        toast.info('Hủy xóa danh mục.', { position: 'top-right', autoClose: 3000 });
      },
    });
  };

  // Xử lý khi form không hợp lệ
  const onFinishFailed = () => {
    toast.error('Vui lòng kiểm tra lại các trường thông tin!', { position: 'top-right', autoClose: 3000 });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      width: '10%',
      align: 'center',
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      sorter: (a, b) => a.categoryName.localeCompare(b.categoryName),
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
            <Button type="default" className="viewButton" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="Sửa danh mục">
            <Button type="default" className="editButton" icon={<EditOutlined />} onClick={() => handleEditModalOpen(record)} />
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
  const paginatedData = filteredCategories.slice(startIndex, endIndex);

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
          .viewButton { background: #f0f2f5; border-color: #595959; color: #595959; transition: all 0.3s ease; }
          .viewButton:hover { background: #595959; color: #fff; border-color: #595959; transform: scale(1.05); }
          .editButton { background: #e6f7ff; border-color: #1a73e8; color: #1a73e8; transition: all 0.3s ease; }
          .editButton:hover { background: #1a73e8; color: #fff; border-color: #1a73e8; transform: scale(1.05); }
          .deleteButton { background: #fff1f0; border-color: #f5222d; color: #f5222d; transition: all 0.3s ease; }
          .deleteButton:hover { background: #f5222d; color: #fff; border-color: #f5222d; transform: scale(1.05); }
          .Toastify__toast--success { background: #e6f7ff !important; color: #1a73e8 !important; font-weight: 500; }
          .Toastify__toast--error { background: #fff1f0 !important; color: #f5222d !important; font-weight: 500; }
          .Toastify__toast--info { background: #f0f2f5 !important; color: #595959 !important; font-weight: 500; }
          .ant-table-placeholder { background: #f9fbff; color: #595959; font-style: italic; }
          .formContainer { background: #f0f7ff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
          .ant-form-item-label > label { font-weight: 500; color: #333; }
          .ant-input, .ant-input-textarea { border-radius: 4px !important; border: 1px solid #d9d9d9 !important; }
          .ant-input:hover, .ant-input-textarea:hover { border-color: #1a73e8 !important; }
          .ant-input:focus, .ant-input-textarea:focus { border-color: #1a73e8 !important; box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important; }
          .submitButton { background: #1a73e8; border-color: #1a73e8; border-radius: 4px; height: 40px; font-weight: 500; transition: all 0.3s ease; }
          .submitButton:hover { background: #1557b0; border-color: #1557b0; transform: scale(1.05); }
          .cancelButton { border-radius: 4px; height: 40px; font-weight: 500; transition: all 0.3s ease; }
          .cancelButton:hover { border-color: #f5222d; color: #f5222d; transform: scale(1.05); }
          .ant-input-search .ant-input { border-radius: 4px 0 0 4px !important; }
          .ant-input-search .ant-btn { border-radius: 0 4px 4px 0 !important; }
        `}
      </style>

      <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
          Danh sách danh mục
        </Title>
        <Card style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', background: '#fff' }}>
        <Spin spinning={initialLoading || loading} tip="Đang tải dữ liệu..." size="large">            
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                Tổng số danh mục: {filteredCategories.length}
              </Title>
              <Space>
                <Input.Search
                  placeholder="Tìm kiếm danh mục"
                  value={searchText}
                  onChange={(e) => dispatch(setSearchText(e.target.value))}
                  onSearch={(value) => dispatch(setSearchText(value))}
                  style={{ width: 200 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddModalOpen}
                  style={{ borderRadius: 4, backgroundColor: '#1a73e8', borderColor: '#1a73e8', height: 40, fontWeight: 500 }}
                >
                  Thêm danh mục mới
                </Button>
              </Space>
            </div>
            <Table
              className="tableContainer"
              columns={columns}
              dataSource={paginatedData}
              rowKey="categoryId"
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredCategories.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} danh mục`,
                onChange: (page, pageSize) => {
                  dispatch(setCurrentPage(page));
                  dispatch(setPageSize(pageSize));
                },
              }}
              locale={{ emptyText: 'Không có dữ liệu danh mục để hiển thị.' }}
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
          footer={[<Button key="close" onClick={handleModalClose}>Đóng</Button>]}
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

        {/* Modal thêm danh mục mới */}
        <Modal
          title="Thêm danh mục mới"
          open={isAddModalVisible}
          onCancel={handleAddModalClose}
          footer={null}
          width={600}
        >
          <Spin spinning={loading} tip="Đang xử lý...">
            <div className="formContainer">
              <Form form={form} layout="vertical" onFinish={onAddFinish} onFinishFailed={onFinishFailed}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="categoryName"
                      label="Tên danh mục"
                      rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                      <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>
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
                  <Button type="primary" htmlType="submit" className="submitButton" loading={loading} style={{ width: 150 }}>
                    Thêm danh mục
                  </Button>
                  <Button className="cancelButton" style={{ marginLeft: 16, width: 150 }} onClick={handleAddModalClose}>
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </Modal>

        {/* Modal chỉnh sửa danh mục */}
        <Modal
          title="Chỉnh sửa danh mục"
          open={isEditModalVisible}
          onCancel={handleEditModalClose}
          footer={null}
          width={600}
        >
          <Spin spinning={loading} tip="Đang xử lý...">
            <div className="formContainer">
              <Form form={editForm} layout="vertical" onFinish={onEditFinish} onFinishFailed={onFinishFailed}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="categoryName"
                      label="Tên danh mục"
                      rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                      <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                  <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục" />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" defaultChecked />
                </Form.Item>
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button type="primary" htmlType="submit" className="submitButton" loading={loading} style={{ width: 150 }}>
                    Cập nhật danh mục
                  </Button>
                  <Button className="cancelButton" style={{ marginLeft: 16, width: 150 }} onClick={handleEditModalClose}>
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </Modal>
      </div>
    </>
  );
};

export default Category;