import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Spin, Form, Input, Switch, Upload, Row, Col, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Image } from 'antd';
import { fetchBrands, fetchBrandDetail, addBrand, updateBrand, deleteBrand, setCurrentPage, setPageSize, setSearchText, clearSelectedBrand } from '../../../redux/reducers/BrandSlice.js';

const { Title } = Typography;
const { TextArea } = Input;

const Brand = () => {
  const dispatch = useDispatch();
  const { brands, filteredBrands, selectedBrand, loading, error, currentPage, pageSize, searchText } = useSelector((state) => state.brands);
  const [initialLoading, setInitialLoading] = useState(true); // Thêm trạng thái initialLoading
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addFileList, setAddFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [initialImage, setInitialImage] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchBrands());
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error('Không thể tải danh sách thương hiệu!', { position: 'top-right', autoClose: 3000 });
      } finally {
        // Giả lập loading 3 giây
        setTimeout(() => {
          setInitialLoading(false);
        }, 3000);
      }
    };
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 3000 });
    }
  }, [error]);

  const handleViewDetail = (record) => {
    dispatch(fetchBrandDetail(record.brandId)).then(() => setIsDetailModalVisible(true));
  };

  const handleAddModalOpen = () => {
    setIsAddModalVisible(true);
    addForm.resetFields();
    addForm.setFieldsValue({ status: true });
    setAddFileList([]);
  };

  const handleAddModalClose = () => {
    setIsAddModalVisible(false);
    addForm.resetFields();
    setAddFileList([]);
  };

  const handleEditModalOpen = (record) => {
    dispatch(fetchBrandDetail(record.brandId)).then((result) => {
      const brandData = result.payload;
      editForm.setFieldsValue({
        brandName: brandData.brandName,
        description: brandData.description,
        status: brandData.status,
      });
      if (brandData.image) {
        setInitialImage(brandData.image);
      } else {
        setInitialImage(null);
      }
      setEditFileList([]);
      setIsEditModalVisible(true);
    });
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setEditFileList([]);
    setInitialImage(null);
    dispatch(clearSelectedBrand());
  };

  const handleAddBrand = (values) => {
    dispatch(addBrand({ ...values, image: addFileList }))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Thêm thương hiệu thành công!', { position: 'top-right', autoClose: 3000 });
          handleAddModalClose();
          dispatch(fetchBrands());
        } else {
          toast.error('Thêm thương hiệu thất bại!', { position: 'top-right', autoClose: 3000 });
        }
      })
      .catch(() => {
        toast.error('Đã xảy ra lỗi khi thêm thương hiệu!', { position: 'top-right', autoClose: 3000 });
      });
  };

  const handleUpdateBrand = (values) => {
    dispatch(updateBrand({ brandId: selectedBrand.brandId, brandData: { ...values, image: editFileList } }))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Cập nhật thương hiệu thành công!', { position: 'top-right', autoClose: 3000 });
          handleEditModalClose();
          dispatch(fetchBrands());
        } else {
          toast.error('Cập nhật thương hiệu thất bại!', { position: 'top-right', autoClose: 3000 });
        }
      })
      .catch(() => {
        toast.error('Đã xảy ra lỗi khi cập nhật thương hiệu!', { position: 'top-right', autoClose: 3000 });
      });
  };

  const handleDelete = (brandId, brandName) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa thương hiệu "${brandName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        dispatch(deleteBrand(brandId))
          .then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
              toast.success(`Xóa thương hiệu "${brandName}" thành công!`, { position: 'top-right', autoClose: 3000 });
              dispatch(setCurrentPage(1));
              dispatch(fetchBrands());
            } else {
              toast.error(`Xóa thương hiệu "${brandName}" thất bại!`, { position: 'top-right', autoClose: 3000 });
            }
          })
          .catch(() => {
            toast.error('Đã xảy ra lỗi khi xóa thương hiệu!', { position: 'top-right', autoClose: 3000 });
          });
      },
      onCancel: () => {
        toast.info('Hủy xóa thương hiệu.', { position: 'top-right', autoClose: 3000 });
      },
    });
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setAddFileList(newFileList);
  };

  const handleEditUploadChange = ({ fileList: newFileList }) => {
    setEditFileList(newFileList);
  };

  const columns = [
    { title: 'STT', render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, width: '5%', align: 'center' },
    { title: 'Tên', dataIndex: 'brandName', key: 'brandName', sorter: (a, b) => a.brandName.localeCompare(b.brandName), width: '20%', align: 'center' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', width: '30%', align: 'center' },
    { 
      title: 'Hình ảnh', 
      dataIndex: 'image', 
      key: 'image', 
      render: (image) => image ? <Image src={image} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} preview={true} /> : 'Không có hình ảnh', 
      width: '15%', 
      align: 'center' 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status) => status ? 'Hoạt động' : 'Không hoạt động', 
      width: '15%', 
      align: 'center' 
    },
    { 
      title: 'Hành động', 
      key: 'action', 
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem"><Button className="viewButton" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} /></Tooltip>
          <Tooltip title="Sửa"><Button className="editButton" icon={<EditOutlined />} onClick={() => handleEditModalOpen(record)} /></Tooltip>
          <Tooltip title="Xóa"><Button className="deleteButton" icon={<DeleteOutlined />} onClick={() => handleDelete(record.brandId, record.brandName)} /></Tooltip>
        </Space>
      ),
      width: '15%',
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
          .viewButton { background: #f0f2f5; border-color: #595959; color: #595959; transition: all 0.3s ease; }
          .viewButton:hover { background: #595959; color: #fff; border-color: #595959; transform: scale(1.05); }
          .editButton { background: #e6f7ff; border-color: #1a73e8; color: #1a73e8; transition: all 0.3s ease; }
          .editButton:hover { background: #1a73e8; color: #fff; border-color: #1a73e8; transform: scale(1.05); }
          .deleteButton { background: #fff1f0; border-color: #f5222d; color: #f5222d; transition: all 0.3s ease; }
          .deleteButton:hover { background: #f5222d; color: #fff; border-color: #f5222d; transform: scale(1.05); }
          .Toastify__toast--success { background: #e6f7ff !important; color: #1a73e8 !important; font-weight: 500; }
          .Toastify__toast--error { background: #fff1f0 !important; color: #f5222d !important; font-weight: 500; }
          .Toastify__toast--info { background: #f0f2f5 !important; color: #595959 !important; font-weight: 500; }
          .formContainer {
            background: #f0f7ff;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .ant-form-item-label > label { font-weight: 500; color: #333; }
          .ant-input, .ant-input-number, .ant-select-selector {
            border-radius: 4px !important;
            border: 1px solid #d9d9d9 !important;
          }
          .ant-input:hover, .ant-input-number:hover, .ant-select-selector:hover {
            border-color: #1a73e8 !important;
          }
          .ant-input:focus, .ant-input-number:focus, .ant-select-selector:focus {
            border-color: #1a73e8 !important;
            box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
          }
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
          .ant-modal-content { border-radius: 8px; }
          .ant-modal-header { border-bottom: 1px solid #e6f0fa; border-radius: 8px 8px 0 0; }
          .ant-modal-footer { border-top: 1px solid #e6f0fa; border-radius: 0 0 8px 8px; }
          .ant-input-search .ant-input { border-radius: 4px 0 0 4px !important; }
          .ant-input-search .ant-btn { border-radius: 0 4px 4px 0 !important; }
        `}
      </style>

      <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '30px' }}>
          Quản lý thương hiệu
        </Title>
        <Card style={{ borderRadius: 8, background: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Spin spinning={initialLoading || loading} tip="Đang tải dữ liệu...">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                Tổng số thương hiệu: {filteredBrands.length}
              </Title>
              <Space>
                <Input.Search
                  placeholder="Tìm kiếm thương hiệu"
                  onSearch={(value) => dispatch(setSearchText(value))}
                  style={{ width: 200 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddModalOpen}
                  style={{ backgroundColor: '#1a73e8', borderColor: '#1a73e8', height: 40, fontWeight: 500 }}
                >
                  Thêm thương hiệu mới
                </Button>
              </Space>
            </div>
            <Table
              className="tableContainer"
              columns={columns}
              dataSource={filteredBrands}
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredBrands.length,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} thương hiệu`,
                onChange: (page, pageSize) => {
                  dispatch(setCurrentPage(page));
                  dispatch(setPageSize(pageSize));
                },
              }}
              rowKey="brandId"
              rowClassName={() => 'table-row'}
            />
          </Spin>
        </Card>

        <Modal
          title="Chi tiết thương hiệu"
          open={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false);
            dispatch(clearSelectedBrand());
          }}
          footer={<Button onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>}
          width={600}
        >
          {selectedBrand && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên">{selectedBrand.brandName}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{selectedBrand.description || 'Không có mô tả'}</Descriptions.Item>
              <Descriptions.Item label="Hình ảnh">
                {selectedBrand.image ? (
                  <Image
                    src={selectedBrand.image}
                    alt="Hình ảnh thương hiệu"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    preview={true}
                  />
                ) : (
                  'Không có hình ảnh'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{selectedBrand.status ? 'Hoạt động' : 'Không hoạt động'}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        <Modal
          title="Thêm thương hiệu mới"
          open={isAddModalVisible}
          onCancel={handleAddModalClose}
          footer={null}
          width={600}
        >
          <Spin spinning={loading} tip="Đang xử lý...">
            <div className="formContainer">
              <Form
                form={addForm}
                layout="vertical"
                onFinish={handleAddBrand}
                onFinishFailed={(errorInfo) => {
                  toast.error('Vui lòng kiểm tra lại các trường thông tin!', { position: 'top-right', autoClose: 3000 });
                }}
                initialValues={{ status: true }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tên thương hiệu"
                      name="brandName"
                      rules={[
                        { required: true, message: 'Tên thương hiệu không được để trống' },
                        { max: 100, message: 'Tên thương hiệu không được vượt quá 100 ký tự' },
                        { whitespace: true, message: 'Tên thương hiệu không được chỉ chứa khoảng trắng' },
                      ]}
                    >
                      <Input placeholder="Nhập tên thương hiệu" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Mô tả" name="description">
                      <TextArea rows={4} placeholder="Nhập mô tả thương hiệu" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Hình ảnh" name="image">
                      <Upload
                        fileList={addFileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Trạng thái" name="status" valuePropName="checked">
                      <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="submitButton"
                    loading={loading}
                    style={{ width: 150 }}
                  >
                    Thêm thương hiệu
                  </Button>
                  <Button
                    className="cancelButton"
                    style={{ marginLeft: 16, width: 150 }}
                    onClick={handleAddModalClose}
                  >
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </Modal>

        <Modal
          title="Sửa thương hiệu"
          open={isEditModalVisible}
          onCancel={handleEditModalClose}
          footer={null}
          width={600}
        >
          <Spin spinning={loading} tip="Đang xử lý...">
            <div className="formContainer">
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleUpdateBrand}
                onFinishFailed={(errorInfo) => {
                  toast.error('Vui lòng kiểm tra lại các trường thông tin!', { position: 'top-right', autoClose: 3000 });
                }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Tên thương hiệu"
                      name="brandName"
                      rules={[
                        { required: true, message: 'Tên thương hiệu không được để trống' },
                        { max: 100, message: 'Tên thương hiệu không được vượt quá 100 ký tự' },
                        { whitespace: true, message: 'Tên thương hiệu không được chỉ chứa khoảng trắng' },
                      ]}
                    >
                      <Input placeholder="Nhập tên thương hiệu" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Mô tả" name="description">
                      <TextArea rows={4} placeholder="Nhập mô tả thương hiệu" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Hình ảnh hiện tại">
                      {initialImage ? (
                        <Image
                          src={initialImage}
                          alt="Hình ảnh thương hiệu"
                          width={100}
                          height={100}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          preview={true}
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
                      getValueFromEvent={(e) => e.fileList}
                    >
                      <Upload
                        fileList={editFileList}
                        onChange={handleEditUploadChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Trạng thái" name="status" valuePropName="checked">
                      <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="submitButton"
                    loading={loading}
                    style={{ width: 150 }}
                  >
                    Cập nhật
                  </Button>
                  <Button
                    className="cancelButton"
                    style={{ marginLeft: 16, width: 150 }}
                    onClick={handleEditModalClose}
                  >
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

export default Brand;