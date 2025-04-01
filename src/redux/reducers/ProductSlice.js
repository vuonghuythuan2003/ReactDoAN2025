import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Action bất đồng bộ để lấy danh sách sản phẩm
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/admin/products', { params: { page: 0, size: 1000 } });
    return response.data.content || response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể lấy danh sách sản phẩm!' });
  }
});

// Action bất đồng bộ để lấy chi tiết sản phẩm
export const fetchProductDetail = createAsyncThunk('products/fetchProductDetail', async (productId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/admin/products/${productId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Không thể lấy chi tiết sản phẩm!' });
  }
});

// Action bất đồng bộ để thêm sản phẩm
export const addProduct = createAsyncThunk('products/addProduct', async (productData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === 'image' && productData[key]?.[0]?.originFileObj) {
        formData.append(key, productData[key][0].originFileObj);
      } else {
        formData.append(key, productData[key]);
      }
    });
    const response = await axios.post('http://localhost:8080/api/v1/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Thêm sản phẩm thất bại!' });
  }
});

// Action bất đồng bộ để cập nhật sản phẩm
export const updateProduct = createAsyncThunk('products/updateProduct', async ({ productId, productData }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === 'image' && productData[key]?.[0]?.originFileObj) {
        formData.append(key, productData[key][0].originFileObj);
      } else {
        formData.append(key, productData[key]);
      }
    });
    const response = await axios.put(`http://localhost:8080/api/v1/admin/products/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Cập nhật sản phẩm thất bại!' });
  }
});

// Action bất đồng bộ để xóa sản phẩm
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (productId, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/v1/admin/products/${productId}`);
    return { productId, message: response.data || 'Xóa sản phẩm thành công!' };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Xóa sản phẩm thất bại!' });
  }
});

// Action để set currentPage, pageSize và searchText
export const setCurrentPage = createAsyncThunk('products/setCurrentPage', async (page) => page);
export const setPageSize = createAsyncThunk('products/setPageSize', async (size) => size);
export const setSearchText = createAsyncThunk('products/setSearchText', async (text) => text);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    filteredProducts: [], // Thêm filteredProducts để lưu danh sách đã lọc
    categories: [],
    brands: [],
    selectedProduct: null,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
    searchText: '', // Thêm searchText vào state
  },
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setBrands: (state, action) => {
      state.brands = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        // Lọc lại danh sách dựa trên searchText hiện tại
        state.filteredProducts = action.payload.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Fetch Product Detail
    builder
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Add Product
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        // Lọc lại danh sách sau khi thêm
        state.filteredProducts = state.products.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload;
        state.products = state.products.map((prod) =>
          prod.productId === updatedProduct.productId ? updatedProduct : prod
        );
        // Lọc lại danh sách sau khi cập nhật
        state.filteredProducts = state.products.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Delete Product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        const { productId } = action.payload;
        state.products = state.products.filter((prod) => prod.productId !== productId);
        // Lọc lại danh sách sau khi xóa
        state.filteredProducts = state.products.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Set Pagination và Search
    builder
      .addCase(setCurrentPage.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })
      .addCase(setPageSize.fulfilled, (state, action) => {
        state.pageSize = action.payload;
      })
      .addCase(setSearchText.fulfilled, (state, action) => {
        state.searchText = action.payload;
        state.filteredProducts = state.products.filter((product) =>
          product.productName.toLowerCase().includes(action.payload.toLowerCase()) ||
          product.sku.toLowerCase().includes(action.payload.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(action.payload.toLowerCase()))
        );
        state.currentPage = 1; // Reset về trang đầu tiên khi tìm kiếm
      });
  },
});

export const { clearSelectedProduct, setCategories, setBrands } = productSlice.actions;
export default productSlice.reducer;