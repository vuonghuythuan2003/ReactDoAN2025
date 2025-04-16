import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Spin, Table, DatePicker, ConfigProvider, theme } from 'antd';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, setDateRange } from '../../../redux/reducers/DashboardSlice';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { useToken } = theme;

const Dashboard = () => {
  const { isDarkMode } = useOutletContext();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    totalUsers,
    newUsersThisMonth,
    topSpendingCustomers,
    revenueData,
    revenueOverTime,
    bestSellerProducts,
    totalInvoices,
    // Removed: trafficData, browserStats
    loading,
    error,
    from,
    to,
  } = useSelector((state) => state.dashboard);

  const defaultFrom = moment().subtract(1, 'years');
  const defaultTo = moment();
  const [dateRange, setLocalDateRange] = useState([defaultFrom, defaultTo]);
  const [initialLoading, setInitialLoading] = useState(true);

  const onDateRangeChange = (dates) => {
    if (dates) {
      setLocalDateRange(dates);
      const newFrom = dates[0].toDate().toISOString();
      const newTo = dates[1].toDate().toISOString();
      dispatch(setDateRange({ from: newFrom, to: newTo }));
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchDashboardData({ from, to })).unwrap();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard!', { position: 'top-right', autoClose: 3000 });
      } finally {
        setTimeout(() => {
          setInitialLoading(false);
        }, 3000);
      }
    };
    fetchInitialData();
  }, [dispatch, from, to]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  const COLORS = ['#1890ff', '#52c41a', '#fadb14', '#ff4d4f', '#fa8c16'];

  const newUsersColumns = [
    { title: 'Họ và Tên', dataIndex: 'fullname', key: 'fullname' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số Điện Thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Địa Chỉ', dataIndex: 'address', key: 'address' },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => roles.map((role) => role.roleName).join(', '),
    },
  ];

  const bestSellerColumns = [
    { title: 'Tên Sản Phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Số Lượng Bán', dataIndex: 'totalQuantitySold', key: 'totalQuantitySold' },
    {
      title: 'Doanh Thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (text) => text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
    },
  ];

  const CustomComponent = () => {
    const { token } = useToken();
    return (
      <div style={{ padding: token.paddingLG, background: isDarkMode ? token.colorBgBase : '#f0f2f5' }}>
        <Spin spinning={initialLoading || loading} tip="Đang tải dữ liệu..." size="large">
          {user?.username && (
            <div style={{ textAlign: 'center', marginBottom: token.marginLG }}>
              <Title level={2} style={{ color: isDarkMode ? '#e6e6e6' : '#333' }}>
                Xin chào, {user.username}!
              </Title>
            </div>
          )}

          <Row style={{ marginBottom: token.marginLG }}>
            <Col>
              <RangePicker
                value={dateRange}
                onChange={onDateRangeChange}
                format="DD/MM/YYYY"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary }}
              />
            </Col>
          </Row>

          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: '#ff4d4f',
                  border: 'none',
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                  textAlign: 'center',
                }}
                hoverable
              >
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {totalUsers.toLocaleString()}
                </Title>
                <p style={{ margin: 0, fontSize: 16, color: '#fff' }}>Tổng số người dùng</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: '#52c41a',
                  border: 'none',
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                  textAlign: 'center',
                }}
                hoverable
              >
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {newUsersThisMonth.length.toLocaleString()}
                </Title>
                <p style={{ margin: 0, fontSize: 16, color: '#fff' }}>Người dùng mới (Tháng này)</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: '#1890ff',
                  border: 'none',
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                  textAlign: 'center',
                }}
                hoverable
              >
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  {totalInvoices.toLocaleString()}
                </Title>
                <p style={{ margin: 0, fontSize: 16, color: '#fff' }}>Tổng số hóa đơn</p>
              </Card>
            </Col>
          </Row>

          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Doanh thu theo thời gian"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                {revenueOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#d9d9d9'} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        stroke={isDarkMode ? '#e6e6e6' : '#000'}
                      />
                      <YAxis stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <Tooltip
                        formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                        contentStyle={{ backgroundColor: isDarkMode ? '#2f2f2f' : '#fff', color: isDarkMode ? '#e6e6e6' : '#000' }}
                      />
                      <Line type="monotone" dataKey="totalRevenue" stroke="#fa8c16" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p>Không có dữ liệu để hiển thị</p>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Doanh thu theo danh mục"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#d9d9d9'} />
                      <XAxis dataKey="categoryName" stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <YAxis stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <Tooltip
                        formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                        contentStyle={{ backgroundColor: isDarkMode ? '#2f2f2f' : '#fff', color: isDarkMode ? '#e6e6e6' : '#000' }}
                      />
                      <Bar dataKey="totalRevenue" fill="#fa8c16" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>Không có dữ liệu để hiển thị</p>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Tài khoản mới trong tháng"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                <Table
                  dataSource={newUsersThisMonth}
                  columns={newUsersColumns}
                  rowKey="key"
                  pagination={{ pageSize: 5 }}
                  bordered
                  style={{ borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Top 10 khách hàng chi tiêu cao nhất"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                {topSpendingCustomers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSpendingCustomers} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#d9d9d9'} />
                      <XAxis dataKey="fullName" stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <YAxis stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <Tooltip
                        formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                        contentStyle={{ backgroundColor: isDarkMode ? '#2f2f2f' : '#fff', color: isDarkMode ? '#e6e6e6' : '#000' }}
                      />
                      <Bar dataKey="totalSpent" fill="#52c41a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>Không có dữ liệu để hiển thị</p>
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Sản phẩm bán chạy nhất"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                <Table
                  dataSource={bestSellerProducts}
                  columns={bestSellerColumns}
                  rowKey="key"
                  pagination={{ pageSize: 5 }}
                  bordered
                  style={{ borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Removed: Traffic Data and Browser Stats
          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24} md={12}>
              <Card
                title="Lượt truy cập theo loại lưu lượng (Mock)"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, visits }) => `${name}: ${(percent * 100).toFixed(2)}% (${visits} lượt)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#2f2f2f' : '#fff', color: isDarkMode ? '#e6e6e6' : '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Thống kê trình duyệt (Mock)"
                style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
                styles={{
                  header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                  },
                }}
                hoverable
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={browserStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#d9d9d9'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                    <YAxis stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#2f2f2f' : '#fff', color: isDarkMode ? '#e6e6e6' : '#000' }} />
                    <Bar dataKey="value" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
          */}
        </Spin>
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1a73e8',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.08)',
          colorBgContainer: isDarkMode ? '#2f2f2f' : '#ffffff',
          colorText: isDarkMode ? '#e6e6e6' : '#000000',
        },
        components: {
          Card: { headerBg: isDarkMode ? '#1f1f1f' : '#1a73e8', headerFontSize: 18, headerHeight: 48 },
          Table: { headerBg: isDarkMode ? '#1f1f1f' : '#1a73e8', headerColor: '#fff', rowHoverBg: isDarkMode ? '#434343' : '#e6f7ff' },
        },
      }}
    >
      <CustomComponent />
    </ConfigProvider>
  );
};

export default Dashboard;