import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Spin, Descriptions, Form, Input, InputNumber, Select, Upload, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Image } from 'antd';
import { fetchProducts, fetchProductDetail, addProduct, updateProduct, deleteProduct, setCurrentPage, setPageSize, clearSelectedProduct, setCategories, setBrands, setSearchText } from '../../../redux/reducers/ProductSlice';
import { BASE_URL_ADMIN } from '../../../api/index'; 

const { Title } = Typography;
const { Option } = Select;

const Product = () => {
  const dispatch = useDispatch();
  const { products, filteredProducts, categories, brands, selectedProduct, loading, error, currentPage, pageSize, totalElements, totalPages, searchText } = useSelector((state) => state.products);
  const [initialLoading, setInitialLoading] = useState(true); // Thêm trạng thái initialLoading
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [initialImage, setInitialImage] = useState(null);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoryRes, brandRes] = await Promise.all([
          BASE_URL_ADMIN.get('/categories', { params: { page: 0, size: 1000 } }),
          BASE_URL_ADMIN.get('/brands', { params: { page: 0, size: 1000 } }),
        ]);
        dispatch(setCategories(categoryRes.data.content || categoryRes.data));
        dispatch(setBrands(brandRes.data.content || brandRes.data));
        dispatch(fetchProducts({ page: currentPage, size: pageSize }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Không thể tải dữ liệu ban đầu!', { position: 'top-right', autoClose: 3000 });
      } finally {
        // Giả lập loading 3 giây
        setTimeout(() => {
          setInitialLoading(false);
        }, 3000);
      }
    };
    fetchInitialData();
  }, [dispatch, currentPage, pageSize]);

  // Hiển thị thông báo lỗi từ Redux
  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'top-right', autoClose: 3000 });
    }
  }, [error]);

  const handleViewDetail = (record) => {
    dispatch(fetchProductDetail(record.productId)).then(() => {
      setIsModalVisible(true);
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    dispatch(clearSelectedProduct());
  };

  const handleAddModalOpen = () => {
    setIsAddModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleAddModalClose = () => {
    setIsAddModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  const handleEditModalOpen = (record) => {
    dispatch(fetchProductDetail(record.productId)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        const productData = result.payload;
        editForm.setFieldsValue({
          productName: productData.productName,
          sku: productData.sku,
          description: productData.description,
          unitPrice: productData.unitPrice,
          stockQuantity: productData.stockQuantity,
          soldQuantity: productData.soldQuantity || 0,
          categoryId: String(productData.categoryId), // Chuyển thành chuỗi
          brandId: String(productData.brandId), // Chuyển thành chuỗi
        });
        setInitialImage(productData.image || null);
        setEditFileList([]);
        setIsEditModalVisible(true);
      }
    });
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setEditFileList([]);
    setInitialImage(null);
    dispatch(clearSelectedProduct());
  };

  const handleDelete = (productId, productName) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        dispatch(deleteProduct(productId)).then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            toast.success(`Xóa sản phẩm "${productName}" thành công!`, { position: 'top-right', autoClose: 3000 });
            dispatch(fetchProducts({ page: currentPage, size: pageSize }));
          }
        });
      },
    });
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleEditUploadChange = ({ fileList: newFileList }) => {
    setEditFileList(newFileList);
  };

  const onAddFinish = (values) => {
    const productData = { ...values, image: fileList };
    dispatch(addProduct(productData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Thêm sản phẩm thành công!', { position: 'top-right', autoClose: 3000 });
        handleAddModalClose();
        dispatch(fetchProducts({ page: currentPage, size: pageSize }));
      }
    });
  };

  const onEditFinish = (values) => {
    const productData = {
      ...values,
      categoryId: String(values.categoryId), // Chuyển thành chuỗi
      brandId: String(values.brandId), // Chuyển thành chuỗi
      image: editFileList.length > 0 ? editFileList : null, // Chỉ gửi file nếu có file mới
    };
    dispatch(updateProduct({ productId: selectedProduct.productId, productData })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Cập nhật sản phẩm thành công!', { position: 'top-right', autoClose: 3000 });
        handleEditModalClose();
        dispatch(fetchProducts({ page: currentPage, size: pageSize }));
      } else {
        toast.error('Cập nhật sản phẩm thất bại!', { position: 'top-right', autoClose: 3000 });
      }
    });
  };

  const onFinishFailed = () => {
    toast.error('Vui lòng kiểm tra lại các trường thông tin!', { position: 'top-right', autoClose: 3000 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
      width: '15%',
      align: 'center',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        image ? (
          <Image src={image} alt="Hình ảnh sản phẩm" width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} preview />
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
        const category = categories.find((cat) => String(cat.categoryId) === String(categoryId));
        return category ? category.categoryName : 'Không có danh mục';
      },
      width: '8%',
      align: 'center',
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brandId',
      key: 'brandId',
      render: (brandId) => {
        const brand = brands.find((br) => String(br.brandId) === String(brandId));
        return brand ? brand.brandName : 'Không có thương hiệu';
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
            <Button type="default" className="viewButton" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="Sửa sản phẩm">
            <Button type="default" className="editButton" icon={<EditOutlined />} onClick={() => handleEditModalOpen(record)} />
          </Tooltip>
          <Tooltip title="Xóa sản phẩm">
            <Button type="default" className="deleteButton" icon={<DeleteOutlined />} onClick={() => handleDelete(record.productId, record.productName)} />
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
          Danh sách sản phẩm
        </Title>
        <Card style={{ borderRadius: 8, background: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Spin spinning={initialLoading || loading} tip="Đang tải dữ liệu...">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, color: '#333' }}>
                Tổng số sản phẩm: {totalElements}
              </Title>
              <Space>
                <Input.Search
                  placeholder="Tìm kiếm sản phẩm"
                  value={searchText}
                  onChange={(e) => dispatch(setSearchText(e.target.value))}
                  onSearch={(value) => dispatch(setSearchText(value))}
                  style={{ width: 200 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddModalOpen}
                  style={{ backgroundColor: '#1a73e8', borderColor: '#1a73e8', height: 40, fontWeight: 500 }}
                >
                  Thêm sản phẩm mới
                </Button>
              </Space>
            </div>
            <Table
              className="tableContainer"
              columns={columns}
              dataSource={filteredProducts}
              rowKey="productId"
              pagination={{
                current: currentPage,
                pageSize,
                total: totalElements,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng ${total} sản phẩm`,
                onChange: (page, pageSize) => {
                  dispatch(setCurrentPage(page));
                  dispatch(setPageSize(pageSize));
                  dispatch(fetchProducts({ page, size: pageSize }));
                },
              }}
              locale={{ emptyText: 'Không có dữ liệu sản phẩm để hiển thị.' }}
              scroll={{ x: 'max-content' }}
              rowClassName={() => 'table-row'}
            />
          </Spin>
        </Card>

        <Modal
          title="Chi tiết sản phẩm"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={<Button onClick={handleModalClose}>Đóng</Button>}
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
                  <Image src={selectedProduct.image} alt="Hình ảnh sản phẩm" width={100} height={100} style={{ objectFit: 'cover', borderRadius: 4 }} preview />
                ) : (
                  'Không có hình ảnh'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giá">{formatCurrency(selectedProduct.unitPrice)}</Descriptions.Item>
              <Descriptions.Item label="Tồn kho">{selectedProduct.stockQuantity}</Descriptions.Item>
              <Descriptions.Item label="Đã bán">{selectedProduct.soldQuantity}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {categories.find((cat) => String(cat.categoryId) === String(selectedProduct.categoryId))?.categoryName || 'Không có danh mục'}
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">
                {brands.find((br) => String(br.brandId) === String(selectedProduct.brandId))?.brandName || 'Không có thương hiệu'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{formatDate(selectedProduct.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">{formatDate(selectedProduct.updatedAt)}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        <Modal
          title="Thêm sản phẩm mới"
          open={isAddModalVisible}
          onCancel={handleAddModalClose}
          footer={null}
          width={800}
        >
          <Spin spinning={loading} tip="Đang xử lý...">
            <div className="formContainer">
              <Form form={form} layout="vertical" onFinish={onAddFinish} onFinishFailed={onFinishFailed} initialValues={{ soldQuantity: 0 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tên sản phẩm"
                      name="productName"
                      rules={[
                        { required: true, message: 'Tên sản phẩm không được để trống' },
                        { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự' },
                      ]}
                    >
                      <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="SKU"
                      name="sku"
                      rules={[
                        { required: true, message: 'SKU không được để trống' },
                        { max: 100, message: 'SKU không được vượt quá 100 ký tự' },
                      ]}
                    >
                      <Input placeholder="Nhập SKU" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
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
                  </Col>
                  <Col span={12}>
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
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Số lượng đã bán"
                      name="soldQuantity"
                      rules={[{ type: 'number', min: 0, message: 'Số lượng đã bán không được âm' }]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng đã bán" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
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
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Thương hiệu"
                      name="brandId"
                      rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                    >
                      <Select placeholder="Chọn thương hiệu">
                        {brands.map((brand) => (
                          <Option key={brand.brandId} value={brand.brandId}>
                            {brand.brandName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Hình ảnh" name="image">
                      <Upload
                        fileList={fileList}
                        onChange={handleUploadChange}
                        beforeUpload={() => false}
                        accept="image/*"
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button type="primary" htmlType="submit" className="submitButton" loading={loading} style={{ width: 150 }}>
                    Thêm sản phẩm
                  </Button>
                  <Button className="cancelButton" style={{ marginLeft: 16, width: 150 }} onClick={handleAddModalClose}>
                    Hủy
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </Modal>

        <Modal
          title="Chỉnh sửa sản phẩm"
          open={isEditModalVisible}
          onCancel={handleEditModalClose}
          footer={null}
          width={800}
        >
          <Spin spinning={loading} tip="Đang xử lý...">
            <div className="formContainer">
              <Form form={editForm} layout="vertical" onFinish={onEditFinish} onFinishFailed={onFinishFailed}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Tên sản phẩm"
                      name="productName"
                      rules={[
                        { required: true, message: 'Tên sản phẩm không được để trống' },
                        { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự' },
                      ]}
                    >
                      <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="SKU"
                      name="sku"
                      rules={[
                        { required: true, message: 'SKU không được để trống' },
                        { max: 100, message: 'SKU không được vượt quá 100 ký tự' },
                      ]}
                    >
                      <Input placeholder="Nhập SKU" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
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
                  </Col>
                  <Col span={12}>
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
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Số lượng đã bán"
                      name="soldQuantity"
                      rules={[{ type: 'number', min: 0, message: 'Số lượng đã bán không được âm' }]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng đã bán" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
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
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Thương hiệu"
                      name="brandId"
                      rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                    >
                      <Select placeholder="Chọn thương hiệu">
                        {brands.map((brand) => (
                          <Option key={brand.brandId} value={brand.brandId}>
                            {brand.brandName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Hình ảnh hiện tại">
                      {initialImage ? (
                        <Image src={initialImage} alt="Hình ảnh sản phẩm" width={100} height={100} style={{ objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <span>Không có hình ảnh</span>
                      )}
                    </Form.Item>
                    <Form.Item label="Hình ảnh mới" name="image">
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
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button type="primary" htmlType="submit" className="submitButton" loading={loading} style={{ width: 150 }}>
                    Cập nhật
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

export default Product;