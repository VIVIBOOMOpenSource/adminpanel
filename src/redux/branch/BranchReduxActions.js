import BranchApi from 'src/apis/viviboom/BranchApi';
import StaffRoleApi from 'src/apis/viviboom/StaffRoleApi';
import { set, clear } from './index';
import store from '../store';

const fetchAllStaffRoleInBranch = async () => store.dispatch(async (dispatch) => {
  const { user, branch } = store.getState();
  const { authToken } = user;
  const { id: branchId } = branch;
  const res = await StaffRoleApi.getList({ authToken, branchIds: [branchId] });
  dispatch(set({
    staffRoles: res.data.staffRoles,
  }));
});

const setCurBranch = async ({ branchId }) => store.dispatch((dispatch) => {
  const { staffRoles, uniqueStaffRoleBranches } = store.getState().user;
  const branchIdStaffRoles = staffRoles.filter((sr) => sr.branchId === branchId);

  // consolidate the highest allowed privileges
  const privileges = branchIdStaffRoles.flatMap((sr) => sr.staffRolePrivileges);
  const privilegesHt = {};
  privileges.forEach((p) => {
    if (!privilegesHt[p.featureType] || privilegesHt[p.featureType] < p.privilegeLevel) {
      privilegesHt[p.featureType] = p.privilegeLevel;
    }
  });

  const branch = uniqueStaffRoleBranches.find((b) => b.id === branchId);

  dispatch(set({
    id: branchId,
    ...branch,
    userStaffRoles: branchIdStaffRoles,
    userStaffRolePrivilegesHt: privilegesHt,
  }));

  fetchAllStaffRoleInBranch();
});

const fetch = async () => store.dispatch(async (dispatch) => {
  const { branch, user } = store.getState();
  const { authToken } = user;
  let response;
  try {
    response = await BranchApi.get({ authToken, branchId: branch.id });
  } catch (e) {
    console.error(e);
  }
  dispatch(set({ ...branch, ...response.data.branch }));
  return response?.data;
});

export default {
  setCurBranch,
  fetchAllStaffRoleInBranch,
  fetch,
  clear,
};
