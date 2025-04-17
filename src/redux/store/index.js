import { configureStore } from '@reduxjs/toolkit';
import brandReducer from '../reducers/BrandSlice.js';
import categoryReducer from '../reducers/CategorySlice.js';
import productReducer from '../reducers/ProductSlice.js';
import orderReducer from '../reducers/OrderSlice.js';
import userReducer from '../reducers/UserSlice.js';
import dashboardReducer from '../reducers/DashboardSlice.js';
import layoutReducer from '../reducers/LayoutSlice.js';
import authReducer from '../reducers/AuthSlice';
import commentReducer from '../reducers/CommentSlice'; 
import cartReducer from '../reducers/CartSlice.js'; 
import orderUserReducer from '../reducers/OrderSliceUser.js'; 
import accountUserReducer from '../reducers/AccountUserSlice.js'; 
import gmailReducer from '../reducers/GmailSlice';
import wishListReducer from '../reducers/WishListSlice.js';
export const store = configureStore({
  reducer: {
    brands: brandReducer,
    categories: categoryReducer,
    products: productReducer,
    orders: orderReducer,
    users: userReducer,
    dashboard: dashboardReducer,
    layout: layoutReducer,
    auth: authReducer,
    comments: commentReducer,
    cart: cartReducer,
    userOrders: orderUserReducer, 
    accountUser: accountUserReducer, // Sử dụng reducer mới
    gmail: gmailReducer,
    wishList: wishListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/fetchCartItems/fulfilled'],
      },
    }),
});