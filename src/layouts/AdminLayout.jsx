import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, theme, Button, ConfigProvider } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ClockCircleOutlined, UserOutlined, ShoppingCartOutlined, AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined, BulbFilled, TagOutlined, CommentOutlined } from '@ant-design/icons';
import { toggleCollapsed, toggleDarkMode } from '../redux/reducers/LayoutSlice'; // Đường dẫn đã sửa

const { Header, Content, Footer, Sider } = Layout;

const items = [
  { key: 'dashboard', icon: <ClockCircleOutlined />, label: 'Thống kê' },
  { key: 'user', icon: <UserOutlined />, label: 'Quản lý người dùng' },
  { key: 'order', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn hàng' },
  { key: 'product', icon: <AppstoreOutlined />, label: 'Quản lý sản phẩm' },
  { key: 'category', icon: <AppstoreOutlined />, label: 'Quản lý danh mục' },
  { key: 'comment/admin', icon: <CommentOutlined />, label: 'Quản lý bình luận' },
  { key: 'brand', icon: <TagOutlined />, label: 'Quản lý thương hiệu' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { collapsed, isDarkMode } = useSelector((state) => state.layout);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    navigate(`/admin/${e.key}`);
  };

  const selectedKey = location.pathname.split('/admin/')[1] || 'dashboard';

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
        <style>
          {`
            .header {
              transition: all 0.3s ease;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            .header:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            }
            .sider {
              transition: width 0.3s ease;
              box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
            }
            .menu-item {
              transition: all 0.3s ease;
            }
            .menu-item:hover {
              transform: scale(1.05);
              background-color: ${isDarkMode ? '#003a8c' : '#e6f7ff'} !important;
            }
            .toggle-button {
              transition: all 0.3s ease;
            }
            .toggle-button:hover {
              transform: scale(1.1);
              background-color: ${isDarkMode ? '#40c4ff' : '#1557b0'} !important;
            }
            .content {
              transition: all 0.3s ease;
            }
          `}
        </style>
        <Header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: isDarkMode ? '#001529' : '#ffffff' }}>
          <div style={{ color: isDarkMode ? '#fff' : '#1a73e8', fontSize: 18, fontWeight: 'bold' }}>
            Watch Store Admin
          </div>
          <Button
            type="primary"
            icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
            onClick={() => dispatch(toggleDarkMode())}
            className="toggle-button"
            style={{ background: isDarkMode ? '#40c4ff' : '#1a73e8', borderColor: isDarkMode ? '#40c4ff' : '#1a73e8' }}
          >
            {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
          </Button>
        </Header>
        <Layout>
          <Sider className="sider" width={250} collapsible collapsed={collapsed} trigger={null} style={{ background: isDarkMode ? '#001529' : '#ffffff' }}>
            <div
              onClick={() => dispatch(toggleCollapsed())}
              style={{
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '18px',
                padding: '0 16px',
                cursor: 'pointer',
                background: isDarkMode ? '#001529' : '#ffffff',
                height: '64px',
                lineHeight: '64px',
                borderBottom: `1px solid ${isDarkMode ? '#424242' : '#f0f0f0'}`,
                transition: 'all 0.3s ease',
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
              items={items}
              onClick={handleMenuClick}
              theme={isDarkMode ? 'dark' : 'light'}
              className="menu-item"
            />
          </Sider>
          <Layout style={{ padding: '24px', background: isDarkMode ? '#141414' : '#f0f2f5' }}>
            <Content className="content" style={{ padding: '24px', margin: 0, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
              <Outlet context={{ isDarkMode, toggleTheme: () => dispatch(toggleDarkMode()) }} />
            </Content>
            <Footer style={{ textAlign: 'center', background: isDarkMode ? '#141414' : '#f0f2f5', color: isDarkMode ? '#e6e6e6' : '#000000' }}>
              Watch Store Admin ©{new Date().getFullYear()} Created by xAI
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;