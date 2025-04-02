import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_ADMIN, getToken } from '../../api/index';

// Action bất đồng bộ để lấy danh sách sản phẩm
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, size = 10, sortBy = 'productName', direction = 'asc' }, { rejectWithValue }) => {
    try {
      const response = await BASE_URL_ADMIN.get('/products', {
        params: {
          page: page - 1,
          size,
          sortBy,
          direction,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể lấy danh sách sản phẩm!' });
    }
  }
);

// Action bất đồng bộ để lấy chi tiết sản phẩm
export const fetchProductDetail = createAsyncThunk(
  'products/fetchProductDetail',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await BASE_URL_ADMIN.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể lấy chi tiết sản phẩm!' });
    }
  }
);

// Action bất đồng bộ để thêm sản phẩm
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        if (key === 'image' && productData[key]?.[0]?.originFileObj) {
          formData.append(key, productData[key][0].originFileObj);
        } else {
          formData.append(key, productData[key]);
        }
      });
      const response = await BASE_URL_ADMIN.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Thêm sản phẩm thất bại!' });
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach((key) => {
        if (key === 'image' && productData[key]?.length > 0 && productData[key][0]?.originFileObj) {
          formData.append(key, productData[key][0].originFileObj); // Gửi file gốc
        } else if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]); // Gửi các trường khác
        }
      });
      const response = await BASE_URL_ADMIN.put(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật sản phẩm thất bại!');
    }
  }
);

// Action bất đồng bộ để xóa sản phẩm
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await BASE_URL_ADMIN.delete(`/products/${productId}`);
      return { productId, message: response.data || 'Xóa sản phẩm thành công!' };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Xóa sản phẩm thất bại!' });
    }
  }
);

// Action để set currentPage, pageSize và searchText
export const setCurrentPage = createAsyncThunk('products/setCurrentPage', async (page) => page);
export const setPageSize = createAsyncThunk('products/setPageSize', async (size) => size);
export const setSearchText = createAsyncThunk('products/setSearchText', async (text) => text);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    filteredProducts: [],
    categories: [],
    brands: [],
    selectedProduct: null,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    sortBy: 'productName',
    direction: 'asc',
    searchText: '',
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
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.filteredProducts = action.payload.content.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

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

    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.filteredProducts = state.products.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
        state.totalElements += 1;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

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

    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        const { productId } = action.payload;
        state.products = state.products.filter((prod) => prod.productId !== productId);
        state.filteredProducts = state.products.filter((product) =>
          product.productName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
        state.totalElements -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

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
        state.currentPage = 1;
      });
  },
});

export const { clearSelectedProduct, setCategories, setBrands } = productSlice.actions;
export default productSlice.reducer;