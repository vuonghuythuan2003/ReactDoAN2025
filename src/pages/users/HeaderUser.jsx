import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logoutUser } from '../../redux/reducers/AuthSlice'; // Thêm import logoutUser
import { fetchCartItems, resetCart } from '../../redux/reducers/CartSlice';
import { resetUserOrders } from '../../redux/reducers/OrderSliceUser';
import { resetUserAccount } from '../../redux/reducers/AccountUserSlice';
import UserAccountModal from '../users/UserAccountModal';
import '../../styles/Home.scss';

const HeaderUser = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user, token } = useSelector((state) => state.auth);
    const { totalItems, loading, hasFetchedCart } = useSelector((state) => state.cart);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.userId && !hasFetchedCart && !loading && token) {
            dispatch(fetchCartItems(user.userId));
        }
    }, [isAuthenticated, user?.userId, dispatch, hasFetchedCart, loading, token]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap(); // Sử dụng logoutUser từ Redux
            dispatch(resetCart());
            dispatch(resetUserOrders());
            dispatch(resetUserAccount());
            toast.success('Đăng xuất thành công!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
        } catch (error) {
            toast.error('Đăng xuất thất bại!', { position: 'top-right', autoClose: 3000 });
        }
    };

    const handleUserClick = () => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để sử dụng chức năng này!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
        } else {
            setIsModalVisible(true);
        }
    };

    const handleRestrictedClick = (path) => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để sử dụng chức năng này!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
        } else {
            navigate(path);
        }
    };

    const handleCartClick = () => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để xem giỏ hàng!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
        } else {
            navigate('/user/cart');
        }
    };

    return (
        <>
            <Navbar expand="lg" className="header">
                <Container>
                    <Navbar.Brand href="/user" className="logo">
                        <span className="logo-x">X</span>WATCH
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto nav-links">
                            <Nav.Link href="/user">Về Xwatch</Nav.Link>
                            <Nav.Link onClick={() => handleRestrictedClick('/user/brands')}>
                                Thương hiệu
                            </Nav.Link>
                            <Nav.Link href="/user/categories/1">Đồng hồ nam</Nav.Link>
                            <Nav.Link href="/user/categories/2">Đồng hồ nữ</Nav.Link>
                            <Nav.Link href="/user/categories/3">Cặp đôi</Nav.Link>
                            <Nav.Link onClick={() => handleRestrictedClick('/user/history')}>
                                Lịch sử mua hàng
                            </Nav.Link>
                        </Nav>
                        <div className="navbar-icons">
                            <div className="hotline">
                                <FiPhone className="icon" />
                                <span>0386675773</span>
                            </div>
                            <div
                                className="cart"
                                onClick={handleCartClick}
                                style={{ cursor: 'pointer', position: 'relative' }}
                            >
                                <FaShoppingCart className="icon" />
                                {totalItems > 0 && (
                                    <span
                                        className="cart-count"
                                        style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '-10px',
                                            background: 'red',
                                            color: 'white',
                                            borderRadius: '50%',
                                            padding: '2px 6px',
                                            fontSize: '12px',
                                        }}
                                    >
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                            <div className="user">
                                <FaUser
                                    className="icon"
                                    style={{ cursor: 'pointer', opacity: isAuthenticated ? 1 : 0.5 }}
                                    title={isAuthenticated ? 'Tài khoản' : 'Đăng nhập'}
                                    onClick={handleUserClick}
                                />
                            </div>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <UserAccountModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                userId={user?.userId}
                onLogout={handleLogout}
            />
        </>
    );
};

export default HeaderUser;