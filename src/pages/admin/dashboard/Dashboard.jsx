import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Spin, Table, DatePicker, ConfigProvider, theme } from 'antd';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { useToken } = theme;

const Dashboard = () => {
  const { isDarkMode } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState([]);
  const [topSpendingCustomers, setTopSpendingCustomers] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [browserStats, setBrowserStats] = useState([]);
  const [revenueData, setRevenueData] = useState([]); 

  const defaultFrom = moment('2025-02-01T00:00:00').toDate();
  const defaultTo = moment('2025-02-27T23:59:59').toDate();
  const [dateRange, setDateRange] = useState([moment(defaultFrom), moment(defaultTo)]);
  const [from, setFrom] = useState(defaultFrom.toISOString());
  const [to, setTo] = useState(defaultTo.toISOString());

  const onDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      setFrom(dates[0].toDate().toISOString());
      setTo(dates[1].toDate().toISOString());
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
          params: {
            page: 0,
            size: 1,
            sortBy: 'createdAt',
            direction: 'desc',
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTotalUsers(userResponse.data.totalElements || 0);

        // Fetch new users this month
        const newUsersThisMonthResponse = await axios.get('http://localhost:8080/api/v1/admin/new-accounts-this-month', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setNewUsersThisMonth(newUsersThisMonthResponse.data || []);

        // Fetch top spending customers
        const topSpendingCustomersResponse = await axios.get('http://localhost:8080/api/v1/admin/reports/top-spending-customers', {
          params: {
            from,
            to,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Top Spending Customers Response:', topSpendingCustomersResponse.data);
        setTopSpendingCustomers(topSpendingCustomersResponse.data || []);

        // Fetch revenue by category
        const revenueResponse = await axios.get('http://localhost:8080/api/v1/admin/reports/revenue-by-category', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setRevenueData(revenueResponse.data || []);

        // Mock data for traffic types (pie chart)
        const mockTrafficData = [
          { name: 'Organic', value: 44.46, visits: 356 },
          { name: 'Referral', value: 5.54, visits: 36 },
          { name: 'Other', value: 50, visits: 245 },
        ];
        setTrafficData(mockTrafficData);

        // Mock data for browser stats (bar chart)
        const mockBrowserStats = [
          { name: 'Google Chrome', value: 50 },
          { name: 'Mozilla Firefox', value: 30 },
          { name: 'Internet Explorer', value: 10 },
          { name: 'Safari', value: 10 },
        ];
        setBrowserStats(mockBrowserStats);

        setLoading(false);
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
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to]);

  // Colors for the pie chart
  const COLORS = ['#1890ff', '#52c41a', '#fadb14', '#ff4d4f', '#fa8c16'];

  // Mock growth rate (since we don't have new users last month)
  const growthRate = newUsersThisMonth.length > 0 ? 46.43 : 0;

  // Table columns for new accounts this month
  const columns = [
    {
      title: 'Họ và Tên',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
    },
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
      render: (roles) => roles.map(role => role.roleName).join(', '),
    },
  ];

  // Custom component to access theme tokens
  const CustomComponent = () => {
    const { token } = useToken();
    return (
      <div
        style={{
          padding: token.paddingLG,
          background: isDarkMode ? token.colorBgBase : '#141414',
        }}
      >
        <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
          {/* Date Range Picker */}
          <Row style={{ marginBottom: token.marginLG }}>
            <Col>
              <RangePicker
                value={dateRange}
                onChange={onDateRangeChange}
                format="DD/MM/YYYY"
                style={{
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowTertiary,
                }}
              />
            </Col>
          </Row>

          {/* Top Metrics */}
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
                  background: '#fadb14',
                  border: 'none',
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                  textAlign: 'center',
                }}
                hoverable
              >
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                  46.41%
                </Title>
                <p style={{ margin: 0, fontSize: 16, color: '#fff' }}>Tỷ lệ thoát (Mock)</p>
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
                  4,054,876
                </Title>
                <p style={{ margin: 0, fontSize: 16, color: '#fff' }}>Lượt xem trang (Mock)</p>
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
                  {growthRate}%
                </Title>
                <p style={{ margin: 0, fontSize: 16, color: '#fff' }}>Tỷ lệ tăng trưởng (Mock)</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: '#fa8c16',
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
          </Row>

          {/* New Accounts This Month (Table) */}
          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Danh sách tài khoản mới trong tháng"
                style={{
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                }}
                headStyle={{
                  background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                  color: '#fff',
                  borderTopLeftRadius: token.borderRadiusLG,
                  borderTopRightRadius: token.borderRadiusLG,
                }}
                hoverable
              >
                <Table
                  dataSource={newUsersThisMonth}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  bordered
                  style={{
                    borderRadius: token.borderRadiusLG,
                    overflow: 'hidden',
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Top Spending Customers */}
          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Top 10 khách hàng chi tiêu cao nhất"
                style={{
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                }}
                headStyle={{
                  background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                  color: '#fff',
                  borderTopLeftRadius: token.borderRadiusLG,
                  borderTopRightRadius: token.borderRadiusLG,
                }}
                hoverable
              >
                {topSpendingCustomers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSpendingCustomers} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#d9d9d9'} />
                      <XAxis dataKey="fullName" stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <YAxis stroke={isDarkMode ? '#e6e6e6' : '#000'} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: isDarkMode ? '#2f2f2f' : '#fff', color: isDarkMode ? '#e6e6e6' : '#000' }} />
                      <Bar dataKey="totalSpent" fill="#52c41a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>Không có dữ liệu để hiển thị</p>
                )}
              </Card>
            </Col>
          </Row>

          {/* Visit by Traffic Types and Browser Stats */}
          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24} md={12}>
              <Card
                title="Lượt truy cập theo loại lưu lượng (Mock)"
                style={{
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                }}
                headStyle={{
                  background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                  color: '#fff',
                  borderTopLeftRadius: token.borderRadiusLG,
                  borderTopRightRadius: token.borderRadiusLG,
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
                style={{
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                }}
                headStyle={{
                  background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                  color: '#fff',
                  borderTopLeftRadius: token.borderRadiusLG,
                  borderTopRightRadius: token.borderRadiusLG,
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

          {/* Revenue by Category */}
          <Row gutter={[token.marginLG, token.marginLG]} style={{ marginBottom: token.marginLG }}>
            <Col xs={24}>
              <Card
                title="Doanh thu theo danh mục"
                style={{
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadow,
                }}
                headStyle={{
                  background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                  color: '#fff',
                  borderTopLeftRadius: token.borderRadiusLG,
                  borderTopRightRadius: token.borderRadiusLG,
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
          Card: {
            headerBg: isDarkMode ? '#1f1f1f' : '#1a73e8',
            headerFontSize: 18,
            headerHeight: 48,
          },
          Table: {
            headerBg: isDarkMode ? '#1f1f1f' : '#1a73e8',
            headerColor: '#fff',
            rowHoverBg: isDarkMode ? '#434343' : '#e6f7ff',
          },
        },
      }}
    >
      <CustomComponent />
    </ConfigProvider>
  );
};

export default Dashboard;