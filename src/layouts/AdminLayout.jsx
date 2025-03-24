import React, { useState } from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined, AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { Layout, Menu, theme, Button, ConfigProvider } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

// Menu ở sidebar
const items2 = [
  {
    key: 'sub1',
    icon: <UserOutlined />,
    label: 'Dashboard',
    children: [
      { key: 'dashboard', label: 'Thống kê khách hàng' },
    ],
  },
  {
    key: 'sub2',
    icon: <UserOutlined />,
    label: 'Quản lý người dùng',
    children: [
      { key: 'user', label: 'Danh sách người dùng' },
    ],
  },
  {
    key: 'sub3',
    icon: <NotificationOutlined />,
    label: 'Quản lý đơn hàng',
    children: [
      { key: 'order', label: 'Danh sách đơn hàng' },
    ],
  },
  {
    key: 'sub4',
    icon: <LaptopOutlined />,
    label: 'Quản lý sản phẩm',
    children: [
      { key: 'add/product', label: 'Thêm sản phẩm' },
      { key: 'product', label: 'Danh sách sản phẩm' },
    ],
  },
  {
    key: 'sub5',
    icon: <AppstoreOutlined />,
    label: 'Quản lý danh mục',
    children: [
      { key: 'add/category', label: 'Thêm danh mục' },
      { key: 'category', label: 'Danh sách danh mục' },
    ],
  },
  {
    key: 'sub6',
    icon: <AppstoreOutlined />,
    label: 'Quản lý bình luận',
    children: [
      { key: 'comment/admin', label: 'Quản lý bình luận' },
    ],
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode to match screenshot

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleMenuClick = (e) => {
    console.log('Navigating to:', `/admin/${e.key}`);
    navigate(`/admin/${e.key}`);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1a73e8',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          colorBgContainer: isDarkMode ? '#141414' : '#ffffff',
          colorText: isDarkMode ? '#e6e6e6' : '#000000',
        },
        components: {
          Menu: {
            darkItemBg: '#001529',
            darkItemColor: '#e6e6e6',
            darkItemSelectedBg: '#1890ff',
            itemBg: '#ffffff',
            itemColor: '#000000',
            itemSelectedBg: '#e6f7ff',
          },
          Layout: {
            siderBg: isDarkMode ? '#001529' : '#ffffff',
            headerBg: isDarkMode ? '#001529' : '#ffffff',
            bodyBg: isDarkMode ? '#141414' : '#f0f2f5',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: isDarkMode ? '#001529' : '#ffffff',
          }}
        >
          <div style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 18, fontWeight: 'bold' }}>
            Admin Panel
          </div>
          <Button
            type="primary"
            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? '#40c4ff' : '#1a73e8',
              borderColor: isDarkMode ? '#40c4ff' : '#1a73e8',
            }}
          >
            {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
          </Button>
        </Header>
        <Layout>
          <Sider
            style={{
              background: isDarkMode ? '#001529' : '#ffffff',
            }}
            width={250}
            collapsible
            collapsed={collapsed}
            trigger={null}
          >
            <div
              onClick={toggleCollapsed}
              style={{
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '18px',
                padding: '0 16px',
                cursor: 'pointer',
                background: isDarkMode ? '#001529' : '#ffffff',
                height: '64px',
                lineHeight: '64px',
                borderBottom: `1px solid ${isDarkMode ? '#424242' : '#f0f0f0'}`,
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Menu
              mode="inline"
              defaultSelectedKeys={['dashboard']}
              defaultOpenKeys={['sub1']}
              style={{
                height: 'calc(100% - 64px)',
                borderRight: 0,
              }}
              items={items2}
              onClick={handleMenuClick}
              theme={isDarkMode ? 'dark' : 'light'}
            />
          </Sider>
          <Layout
            style={{
              padding: '24px',
              background: isDarkMode ? '#141414' : '#f0f2f5',
            }}
          >
            <Content
              style={{
                padding: '24px',
                margin: 0,
                minHeight: 280,
                background: isDarkMode ? '#1f1f1f' : colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet context={{ isDarkMode, toggleTheme }} />
            </Content>
            <Footer
              style={{
                textAlign: 'center',
                background: isDarkMode ? '#141414' : '#f0f2f5',
                color: isDarkMode ? '#e6e6e6' : '#000000',
              }}
            >
              Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;