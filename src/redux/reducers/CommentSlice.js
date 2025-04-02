import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL_ADMIN } from '../../api/index'; // Sử dụng BASE_URL_ADMIN đã cấu hình interceptor

// Action bất đồng bộ để lấy tất cả bình luận
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await BASE_URL_ADMIN.get('/comments');
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải bình luận!');
    }
  }
);

// Action bất đồng bộ để thêm phản hồi cho bình luận
export const addReply = createAsyncThunk(
  'comments/addReply',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const response = await BASE_URL_ADMIN.post(`/comments/${commentId}/reply`, { content });
      return { commentId, reply: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể thêm phản hồi!');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    loading: false,
    error: null,
    replyInputs: {}, // Lưu nội dung phản hồi tạm thời cho từng comment
  },
  reducers: {
    setReplyInput: (state, action) => {
      const { commentId, value } = action.payload;
      state.replyInputs[commentId] = value;
    },
    clearReplyInput: (state, action) => {
      const { commentId } = action.payload;
      state.replyInputs[commentId] = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addReply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        state.loading = false;
        const { commentId, reply } = action.payload;
        state.comments = state.comments.map((comment) =>
          comment.id === commentId ? { ...comment, reply } : comment
        );
      })
      .addCase(addReply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setReplyInput, clearReplyInput } = commentSlice.actions;
export default commentSlice.reducer;