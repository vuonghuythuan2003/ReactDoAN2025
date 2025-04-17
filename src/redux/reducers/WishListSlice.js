import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_USER } from '../../api/index'; // Sử dụng BASE_URL_USER từ axios.js
import { getUserId } from '../../api/index'; // Lấy userId từ cookies

// Thêm vào WishList
export const addToWishList = createAsyncThunk(
    'wishList/addToWishList',
    async ({ productId }, { rejectWithValue }) => {
        try {
            const userId = getUserId(); // Lấy userId từ cookies
            if (!userId) {
                throw new Error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
            }
            const response = await BASE_URL_USER.post(`/wish-list?userId=${userId}`, { productId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || 'Có lỗi khi thêm vào WishList');
        }
    }
);

// Lấy danh sách WishList
export const fetchWishList = createAsyncThunk(
    'wishList/fetchWishList',
    async (_, { rejectWithValue }) => {
        try {
            const userId = getUserId(); // Lấy userId từ cookies
            if (!userId) {
                throw new Error('Vui lòng đăng nhập để xem danh sách yêu thích');
            }
            const response = await BASE_URL_USER.get(`/wish-list?userId=${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || 'Có lỗi khi lấy danh sách WishList');
        }
    }
);

// Xóa khỏi WishList
export const removeFromWishList = createAsyncThunk(
    'wishList/removeFromWishList',
    async (wishListId, { rejectWithValue }) => {
        try {
            const response = await BASE_URL_USER.delete(`/wish-list/${wishListId}`);
            return { wishListId, message: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || 'Có lỗi khi xóa khỏi WishList');
        }
    }
);

const wishListSlice = createSlice({
    name: 'wishList',
    initialState: {
        wishList: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetWishList: (state) => {
            state.wishList = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToWishList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToWishList.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addToWishList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchWishList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishList.fulfilled, (state, action) => {
                state.loading = false;
                state.wishList = action.payload;
            })
            .addCase(fetchWishList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(removeFromWishList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromWishList.fulfilled, (state, action) => {
                state.loading = false;
                state.wishList = state.wishList.filter(item => item.wishListId !== action.payload.wishListId);
            })
            .addCase(removeFromWishList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetWishList } = wishListSlice.actions;
export default wishListSlice.reducer;