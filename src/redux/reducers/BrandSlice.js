import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch all brands
export const fetchBrands = createAsyncThunk('brands/fetchBrands', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:8080/api/v1/admin/brands', {
      params: { page: 0, size: 1000 },
    });
    return response.data.content || response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách thương hiệu!');
  }
});

// Async thunk to fetch brand details by ID
export const fetchBrandDetail = createAsyncThunk('brands/fetchBrandDetail', async (brandId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/v1/admin/brands/${brandId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể lấy chi tiết thương hiệu!');
  }
});

// Async thunk to add a new brand
export const addBrand = createAsyncThunk('brands/addBrand', async (brandData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.entries(brandData).forEach(([key, value]) => {
      if (key === 'image' && value && value.length > 0) {
        formData.append(key, value[0].originFileObj);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = await axios.post('http://localhost:8080/api/v1/admin/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Thêm thương hiệu thất bại!');
  }
});

export const updateBrand = createAsyncThunk('brands/updateBrand', async ({ brandId, brandData }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    Object.entries(brandData).forEach(([key, value]) => {
      if (key === 'image' && value && value.length > 0) {
        formData.append(key, value[0].originFileObj); 
      } else if (key !== 'image' && value !== undefined && value !== null) {
        formData.append(key, value); 
      }
    });
    const response = await axios.put(`http://localhost:8080/api/v1/admin/brands/${brandId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Cập nhật thương hiệu thất bại!');
  }
});

// Async thunk to delete a brand
export const deleteBrand = createAsyncThunk('brands/deleteBrand', async (brandId, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:8080/api/v1/admin/brands/${brandId}`);
    return brandId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Xóa thương hiệu thất bại!');
  }
});

const BrandSlice = createSlice({
  name: 'brands',
  initialState: {
    brands: [],
    filteredBrands: [],
    selectedBrand: null,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
    searchText: '',
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setSearchText: (state, action) => {
      state.searchText = action.payload;
      state.filteredBrands = state.brands.filter((brand) =>
        brand.brandName.toLowerCase().includes(action.payload.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(action.payload.toLowerCase()))
      );
      state.currentPage = 1;
    },
    clearSelectedBrand: (state) => {
      state.selectedBrand = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Brands
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
        state.filteredBrands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Brand Detail
      .addCase(fetchBrandDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBrand = action.payload;
      })
      .addCase(fetchBrandDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Brand
      .addCase(addBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands.push(action.payload);
        state.filteredBrands.push(action.payload);
      })
      .addCase(addBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Brand
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = state.brands.map((brand) =>
          brand.brandId === action.payload.brandId ? action.payload : brand
        );
        state.filteredBrands = state.filteredBrands.map((brand) =>
          brand.brandId === action.payload.brandId ? action.payload : brand
        );
        state.selectedBrand = null;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Brand
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = state.brands.filter((brand) => brand.brandId !== action.payload);
        state.filteredBrands = state.filteredBrands.filter((brand) => brand.brandId !== action.payload);
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage, setPageSize, setSearchText, clearSelectedBrand } = BrandSlice.actions;
export default BrandSlice.reducer;