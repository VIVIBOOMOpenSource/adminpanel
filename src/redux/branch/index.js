import { createSlice } from '@reduxjs/toolkit';

const initialState = {
/**
  id,
  name,
  staffRoles[] {
  },
  userStaffRoles [] {
  },
  userStaffRolePrivilegesHt{} { // flattened highest permission privileges
    type: level
  }
*/
};

export const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    set: (state, action) => ({ ...state, ...action.payload }),
    clear: () => ({}),
  },
});

export const { set, clear } = branchSlice.actions;
export default branchSlice.reducer;
