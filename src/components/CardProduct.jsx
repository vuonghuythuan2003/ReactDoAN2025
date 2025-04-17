import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserId } from '../api/index'; // Lấy userId từ cookies
import { addToWishList, fetchWishList, removeFromWishList } from '../redux/reducers/WishListSlice';
import { FaHeart } from 'react-icons/fa'; // Sử dụng biểu tượng trái tim từ react-icons
import '../styles/CardProduct.scss';

const CardProduct = ({ product, onViewDetail }) => {
    const dispatch = useDispatch();
    const { wishList, loading } = useSelector((state) => state.wishList);
    const [isInWishList, setIsInWishList] = useState(false);
    const userId = getUserId(); // Lấy userId từ cookies

    useEffect(() => {
        if (userId) {
            dispatch(fetchWishList()); // Lấy danh sách WishList khi component mount
        }
    }, [dispatch, userId]);

    useEffect(() => {
        // Kiểm tra xem sản phẩm có trong WishList không
        const found = wishList.find(item => item.productId === product.productId);
        setIsInWishList(!!found);
    }, [wishList, product.productId]);

    const handleAddToWishList = async () => {
        if (!userId) {
            toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        try {
            if (isInWishList) {
                // Xóa khỏi WishList
                const wishListItem = wishList.find(item => item.productId === product.productId);
                await dispatch(removeFromWishList(wishListItem.wishListId)).unwrap();
                toast.success('Đã xóa khỏi danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            } else {
                // Thêm vào WishList
                await dispatch(addToWishList({ productId: product.productId })).unwrap();
                toast.success('Đã thêm vào danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            }
            dispatch(fetchWishList()); // Cập nhật lại danh sách WishList
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra!', { position: 'top-right', autoClose: 3000 });
        }
    };

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Img
                variant="top"
                src={product.image || 'https://picsum.photos/300?random=1'}
                alt={product.productName}
                onError={(e) => (e.target.src = 'https://picsum.photos/300?random=1')}
            />
            <Card.Body>
                <Card.Title className="text-center">{product.productName || 'Không có tên'}</Card.Title>
                <Card.Text className="text-center">
                    {product.description || 'Không có mô tả'}
                </Card.Text>
                <Card.Text className="text-center text-danger">
                    {product.unitPrice != null ? product.unitPrice.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ
                </Card.Text>
                <Button variant="primary" className="w-100 mb-2" onClick={() => onViewDetail(product.productId)}>
                    Xem chi tiết
                </Button>
                {userId && (
                    <Button
                        variant={isInWishList ? 'danger' : 'outline-primary'}
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={handleAddToWishList}
                        disabled={loading}
                    >
                        <FaHeart
                            style={{
                                marginRight: isInWishList ? 0 : '5px', // Không cần margin nếu là "Xóa"
                                color: isInWishList ? 'red' : 'inherit', // Trái tim đỏ khi đã thêm
                            }}
                        />
                        {isInWishList ? '' : 'Thêm vào yêu thích'} {/* Chỉ hiển thị text khi chưa thêm */}
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
};

export default CardProduct;