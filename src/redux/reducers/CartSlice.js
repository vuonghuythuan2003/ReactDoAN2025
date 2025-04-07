import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_USER } from '../../api/index';

// Lấy danh sách sản phẩm trong giỏ hàng
export const fetchCartItems = createAsyncThunk(
    'cart/fetchCartItems',
    async (userId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        if (!token) {
            return rejectWithValue('Không có token, có thể người dùng đã đăng xuất');
        }
        try {
            console.log('Sending request to /cart/list with userId:', userId);
            const response = await BASE_URL_USER.get(`/cart/list?userId=${userId}`, {
                headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
            });
            console.log('Response from /cart/list:', response.data);
            const mappedItems = response.data.map(item => ({
                cartItemId: item.shoppingCartId,
                productId: item.productId,
                productName: item.productName,
                unitPrice: item.unitPrice,
                orderQuantity: item.orderQuantity,
                productImage: item.image || null,
            }));
            return mappedItems;
        } catch (error) {
            console.error('Error fetching cart items:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Thêm sản phẩm vào giỏ hàng
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ userId, requestDTO }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            const response = await BASE_URL_USER.post(`/cart/add?userId=${userId}`, requestDTO);
            const newItem = response.data;
            return {
                cartItemId: newItem.shoppingCartId,
                productId: newItem.productId,
                productName: newItem.productName,
                unitPrice: newItem.unitPrice,
                orderQuantity: newItem.orderQuantity,
                productImage: newItem.image || null,
            };
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Cập nhật số lượng sản phẩm
export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ cartItemId, quantity }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            const response = await BASE_URL_USER.put(`/cart/items/${cartItemId}`, { quantity });
            const updatedItem = response.data;
            return {
                cartItemId: updatedItem.shoppingCartId,
                productId: updatedItem.productId,
                productName: updatedItem.productName,
                unitPrice: updatedItem.unitPrice,
                orderQuantity: updatedItem.orderQuantity,
                productImage: updatedItem.image || null,
            };
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = createAsyncThunk(
    'cart/removeCartItem',
    async ({ userId, cartItemId }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            await BASE_URL_USER.delete(`/cart/${cartItemId}`, {
                headers: {
                    userId: userId.toString(),
                },
            });
            return cartItemId;
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Xóa toàn bộ giỏ hàng
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (userId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            await BASE_URL_USER.delete(`/cart/clear`, {
                headers: {
                    userId: userId.toString(),
                },
            });
            return;
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Thanh toán bằng PayPal
export const checkoutCart = createAsyncThunk(
    'cart/checkoutCart',
    async ({ userId, receiveAddress, receiveName, receivePhone, note }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            console.log('Checkout PayPal - Token:', token);
            const response = await BASE_URL_USER.post(
                `/cart/checkout?userId=${userId}&receiveAddress=${encodeURIComponent(receiveAddress)}&receiveName=${encodeURIComponent(receiveName)}&receivePhone=${encodeURIComponent(receivePhone)}${note ? `&note=${encodeURIComponent(note)}` : ''}`,
                {}
            );
            if (response.data && response.data.redirectUrl) {
                return response.data;
            }
            throw new Error('Không nhận được URL thanh toán từ server');
        } catch (error) {
            console.error('Error in checkoutCart:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Thanh toán bằng COD
export const checkoutCOD = createAsyncThunk(
    'cart/checkoutCOD',
    async ({ userId, receiveAddress, receiveName, receivePhone, note }, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const token = auth.token;
        try {
            console.log('Checkout COD - Token:', token);
            const response = await BASE_URL_USER.post(
                `/cart/checkout/cod?userId=${userId}&receiveAddress=${encodeURIComponent(receiveAddress)}&receiveName=${encodeURIComponent(receiveName)}&receivePhone=${encodeURIComponent(receivePhone)}${note ? `&note=${encodeURIComponent(note)}` : ''}`,
                {}
            );
            console.log('Response from /cart/checkout/cod:', response.data);
            if (response.data && response.data.orderId) {
                return response.data;
            }
            throw new Error('Không nhận được mã đơn hàng từ server');
        } catch (error) {
            console.error('Error in checkoutCOD:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                return rejectWithValue('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            }
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Xác nhận thanh toán PayPal thành công
export const checkoutSuccess = createAsyncThunk(
    'cart/checkoutSuccess',
    async ({ paymentId, payerId, userId, receiveAddress, receiveName, receivePhone, note }, { rejectWithValue }) => {
        try {
            const response = await BASE_URL_USER.get(
                `/cart/checkout/success?paymentId=${paymentId}&PayerID=${payerId}&userId=${userId}&receiveAddress=${encodeURIComponent(receiveAddress)}&receiveName=${encodeURIComponent(receiveName)}&receivePhone=${encodeURIComponent(receivePhone)}${note ? `&note=${encodeURIComponent(note)}` : ''}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalItems: 0,
        loading: false,
        error: null,
        checkoutRedirectUrl: null, // Dùng cho PayPal
        orderId: null, // Dùng cho COD
        hasFetchedCart: false,
    },
    reducers: {
        resetCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.loading = false;
            state.error = null;
            state.checkoutRedirectUrl = null;
            state.orderId = null;
            state.hasFetchedCart = false;
        },
        clearCheckoutRedirect: (state) => {
            state.checkoutRedirectUrl = null;
            state.orderId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.totalItems = action.payload.reduce((total, item) => total + item.orderQuantity, 0);
                state.hasFetchedCart = true;
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                const newItem = action.payload;
                const existingItem = state.items.find((item) => item.productId === newItem.productId);
                if (existingItem) {
                    existingItem.orderQuantity = newItem.orderQuantity;
                } else {
                    state.items.push(newItem);
                }
                state.totalItems = state.items.reduce((total, item) => total + item.orderQuantity, 0);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                const updatedItem = action.payload;
                const index = state.items.findIndex((item) => item.cartItemId === updatedItem.cartItemId);
                if (index !== -1) {
                    state.items[index] = updatedItem;
                }
                state.totalItems = state.items.reduce((total, item) => total + item.orderQuantity, 0);
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(removeCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter((item) => item.cartItemId !== action.payload);
                state.totalItems = state.items.reduce((total, item) => total + item.orderQuantity, 0);
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.totalItems = 0;
                state.hasFetchedCart = false;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(checkoutCart.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.checkoutRedirectUrl = null;
            })
            .addCase(checkoutCart.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutRedirectUrl = action.payload.redirectUrl;
            })
            .addCase(checkoutCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.checkoutRedirectUrl = null;
            })
            .addCase(checkoutCOD.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.orderId = null;
            })
            .addCase(checkoutCOD.fulfilled, (state, action) => {
                state.loading = false;
                state.orderId = action.payload.orderId;
                state.items = []; // Xóa giỏ hàng sau khi thanh toán COD thành công
                state.totalItems = 0;
            })
            .addCase(checkoutCOD.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.orderId = null;
            })
            .addCase(checkoutSuccess.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkoutSuccess.fulfilled, (state, action) => {
                state.loading = false;
                state.items = [];
                state.totalItems = 0;
                state.orderId = action.payload.message.split('Mã đơn hàng: ')[1];
            })
            .addCase(checkoutSuccess.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetCart, clearCheckoutRedirect } = cartSlice.actions;
export default cartSlice.reducer;