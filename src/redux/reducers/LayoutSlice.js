import { createSlice } from '@reduxjs/toolkit';

const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    collapsed: false,
    isDarkMode: true,
  },
  reducers: {
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setCollapsed: (state, action) => {
      state.collapsed = action.payload;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { toggleCollapsed, toggleDarkMode, setCollapsed, setDarkMode } = layoutSlice.actions;
export default layoutSlice.reducer;