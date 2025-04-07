import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, theme, Button, ConfigProvider, Space } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ClockCircleOutlined, UserOutlined, ShoppingCartOutlined, AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BulbOutlined, BulbFilled, TagOutlined, CommentOutlined, LogoutOutlined } from '@ant-design/icons';
import { toggleCollapsed, toggleDarkMode } from '../redux/reducers/LayoutSlice';
import { clearCurrentUser } from '../redux/reducers/UserSlice';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import styles from '../styles/AdminLayout.module.scss';
import { logout } from '../services/authService'; 

const { Header, Content, Footer, Sider } = Layout;

const items = [
  { key: 'dashboard', icon: <ClockCircleOutlined />, label: 'Thống kê' },
  { key: 'user', icon: <UserOutlined />, label: 'Quản lý người dùng' },
  { key: 'order', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn hàng' },
  { key: 'product', icon: <AppstoreOutlined />, label: 'Quản lý sản phẩm' },
  { key: 'category', icon: <AppstoreOutlined />, label: 'Quản lý danh mục' },
  { key: 'brand', icon: <TagOutlined />, label: 'Quản lý thương hiệu' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { collapsed, isDarkMode } = useSelector((state) => state.layout);
  const { currentUser } = useSelector((state) => state.users);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    navigate(`/admin/${e.key}`);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Sử dụng hàm logout từ authService
      dispatch(clearCurrentUser());
      navigate('/login');
      toast.success('Đăng xuất thành công!', { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Lỗi trong quá trình đăng xuất:', error);
      // Dù có lỗi, vẫn đảm bảo xóa trạng thái phía client
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      dispatch(clearCurrentUser());
      navigate('/login');
      toast.error('Đã xảy ra lỗi khi đăng xuất!', { position: 'top-right', autoClose: 3000 });
    }
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
        <Header
          className={styles.header}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: isDarkMode ? '#001529' : '#ffffff',
          }}
        >
          <div
            className={styles.logo}
            style={{
              '--logo-color': isDarkMode ? '#fff' : '#1a73e8',
            }}
          >
            Watch Store Admin
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentUser && currentUser.username ? (
              <span
                className={styles.username}
                style={{
                  '--username-color': isDarkMode ? '#e6e6e6' : '#1a73e8',
                  marginRight: 32, // Thêm khoảng cách giữa "Xin chào" và các nút
                }}
              >
                Xin chào, {currentUser.username}
              </span>
            ) : (
              <span
                className={styles.username}
                style={{
                  '--username-color': isDarkMode ? '#e6e6e6' : '#1a73e8',
                  marginRight: 32, // Thêm khoảng cách giữa "Xin chào" và các nút
                }}
              >
                Xin chào, Admin
              </span>
            )}
            <Space size="middle">
              <Button
                type="primary"
                icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
                onClick={() => dispatch(toggleDarkMode())}
                className={styles.toggleButton}
                style={{
                  background: isDarkMode ? '#40c4ff' : '#1a73e8',
                  borderColor: isDarkMode ? '#40c4ff' : '#1a73e8',
                  '--toggle-button-hover-bg': isDarkMode ? '#40c4ff' : '#1557b0',
                }}
              >
                {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              </Button>
              <Button
                type="primary"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className={styles.logoutButton}
                style={{
                  background: isDarkMode ? '#ff4d4f' : '#f5222d',
                  borderColor: isDarkMode ? '#ff4d4f' : '#f5222d',
                  '--logout-button-hover-bg': isDarkMode ? '#ff4d4f' : '#f5222d',
                }}
              >
                Đăng xuất
              </Button>
            </Space>
          </div>
        </Header>
        <Layout>
          <Sider
            className={styles.sider}
            width={250}
            collapsible
            collapsed={collapsed}
            trigger={null}
            style={{ background: isDarkMode ? '#001529' : '#ffffff' }}
          >
            <div
              onClick={() => dispatch(toggleCollapsed())}
              className={styles.toggleIcon}
              style={{
                '--toggle-icon-color': isDarkMode ? '#fff' : '#000',
                '--toggle-icon-bg': isDarkMode ? '#001529' : '#ffffff',
                '--toggle-icon-border': `1px solid ${isDarkMode ? '#424242' : '#f0f0f0'}`,
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
              className={styles.menuItem}
              style={{
                '--menu-hover-bg': isDarkMode ? '#003a8c' : '#e6f7ff',
              }}
            />
          </Sider>
          <Layout style={{ padding: '24px', background: isDarkMode ? '#141414' : '#f0f2f5' }}>
            <Content
              className={styles.content}
              style={{
                padding: '24px',
                margin: 0,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet context={{ isDarkMode, toggleTheme: () => dispatch(toggleDarkMode()) }} />
            </Content>
            <Footer
              style={{
                textAlign: 'center',
                background: isDarkMode ? '#141414' : '#f0f2f5',
                color: isDarkMode ? '#e6e6e6' : '#000000',
              }}
            >
              Watch Store Admin ©{new Date().getFullYear()} Created by Vuong Huy Thuan
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;