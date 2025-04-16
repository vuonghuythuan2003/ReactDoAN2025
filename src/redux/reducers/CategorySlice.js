import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_ADMIN, getToken } from '../../api/index'; // Import BASE_URL_ADMIN và getToken

// Action bất đồng bộ để lấy danh sách danh mục
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const token = getToken(); // Lấy token từ cookies
    const response = await BASE_URL_ADMIN.get('/categories', {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào header
      },
    });
    return response.data.content || response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể lấy danh sách danh mục!');
  }
});

// Action bất đồng bộ để lấy chi tiết danh mục
export const fetchCategoryDetail = createAsyncThunk('categories/fetchCategoryDetail', async (categoryId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.get(`/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Không thể lấy chi tiết danh mục!');
  }
});

// Action bất đồng bộ để thêm danh mục
export const addCategory = createAsyncThunk('categories/addCategory', async (categoryData, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.post('/categories', categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Thêm danh mục thất bại!' });
  }
});

// Action bất đồng bộ để cập nhật danh mục
export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ categoryId, categoryData }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.put(`/categories/${categoryId}`, categoryData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Cập nhật danh mục thất bại!' });
  }
});

export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (categoryId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const response = await BASE_URL_ADMIN.delete(`/categories/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { categoryId, message: response.data || 'Xóa danh mục thành công!' };
  } catch (error) {
    const errorMessage = typeof error.response?.data === 'string' 
      ? error.response.data 
      : error.response?.data?.message || error.message || 'Xóa danh mục thất bại!';
    return rejectWithValue(errorMessage);
  }
});

// Action để set currentPage, pageSize và searchText
export const setCurrentPage = createAsyncThunk('categories/setCurrentPage', async (page) => page);
export const setPageSize = createAsyncThunk('categories/setPageSize', async (size) => size);
export const setSearchText = createAsyncThunk('categories/setSearchText', async (text) => text);

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    filteredCategories: [],
    selectedCategory: null,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
    searchText: '',
  },
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        // Lọc lại danh sách dựa trên searchText hiện tại
        state.filteredCategories = action.payload.filter((category) =>
          category.categoryName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Category Detail
    builder
      .addCase(fetchCategoryDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Category
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        // Lọc lại danh sách sau khi thêm
        state.filteredCategories = state.categories.filter((category) =>
          category.categoryName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Update Category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCategory = action.payload;
        state.categories = state.categories.map((cat) =>
          cat.categoryId === updatedCategory.categoryId ? updatedCategory : cat
        );
        // Lọc lại danh sách sau khi cập nhật
        state.filteredCategories = state.categories.filter((category) =>
          category.categoryName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Delete Category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId } = action.payload;
        state.categories = state.categories.filter((cat) => cat.categoryId !== categoryId);
        // Lọc lại danh sách sau khi xóa
        state.filteredCategories = state.categories.filter((category) =>
          category.categoryName.toLowerCase().includes(state.searchText.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(state.searchText.toLowerCase()))
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.filteredCategories = state.categories.filter((category) =>
          category.categoryName.toLowerCase().includes(action.payload.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(action.payload.toLowerCase()))
        );
        state.currentPage = 1; // Reset về trang đầu tiên khi tìm kiếm
      });
  },
});

export const { clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;