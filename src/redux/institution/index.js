import { createSlice } from '@reduxjs/toolkit';

const initialState = {
/**
  id, code, domain, adminFrontUrl, frontEndUrl, name, countryISO, tzIANA,
*/
};

export const institutionSlice = createSlice({
  name: 'institution',
  initialState,
  reducers: {
    set: (state, action) => ({ ...state, ...action.payload }),
    clear: () => ({}),
  },
});

export const { set, clear } = institutionSlice.actions;
export default institutionSlice.reducer;
