import AuthApi from 'src/apis/viviboom/AuthApi';
import UserApi from 'src/apis/viviboom/UserApi';
import { set, clear } from './index';
import store from '../store';
import BranchReduxActions from '../branch/BranchReduxActions';
import InstitutionReduxActions from '../institution/InstitutionReduxActions';

const cacheUniqueStaffRoleBranches = async () => store.dispatch((dispatch) => {
  const uniqueBranches = [];
  const { staffRoles } = store.getState().user;
  const nonUniqueBranches = staffRoles.map((sr) => sr.branch);
  nonUniqueBranches.forEach((b) => {
    if (b && !uniqueBranches.find((ub) => ub.id === b.id)) {
      uniqueBranches.push(b);
    }
  });

  dispatch(set({
    uniqueStaffRoleBranches: uniqueBranches,
  }));
});

const verifyEmail = async ({ authToken, token }) => store.dispatch(async (dispatch) => {
  const response = await AuthApi.verifyEmail({ authToken, token });
  if (!response.data.staffRoles?.length) {
    throw new Error('Not a staff!');
  }
  dispatch(set(response.data));
  cacheUniqueStaffRoleBranches();
  BranchReduxActions.setCurBranch({ branchId: response.data.staffRoles[0].branchId });
  InstitutionReduxActions.fetch();
  return response.data;
});

const login = async ({ username, password }) => store.dispatch(async (dispatch) => {
  const response = await AuthApi.login({ username, password });
  if (!response.data.staffRoles?.length) {
    throw new Error('Not a staff!');
  }
  dispatch(set(response.data));
  cacheUniqueStaffRoleBranches();
  BranchReduxActions.setCurBranch({ branchId: response.data.staffRoles[0].branchId });
  InstitutionReduxActions.fetch();
  return response.data;
});

const logout = async () => store.dispatch(async (dispatch) => {
  const { authToken } = store.getState().user;
  let response;
  try {
    response = await AuthApi.logout({ authToken });
  } catch (e) {
    console.error(e);
  }
  dispatch(clear());
  dispatch(BranchReduxActions.clear());
  InstitutionReduxActions.clearInstitution();
  return response?.data;
});

const clearUser = async () => store.dispatch((dispatch) => {
  dispatch(clear());
  dispatch(BranchReduxActions.clear());
  dispatch(InstitutionReduxActions.clear());
});

const fetch = async () => store.dispatch(async (dispatch) => {
  const { user } = store.getState();
  const { id, authToken } = user;
  let response;
  try {
    response = await UserApi.get({ authToken, userId: id, verboseAttributes: ['staffRoles'] });
  } catch (e) {
    console.error(e);
  }
  dispatch(set({ ...user, ...response.data.user }));
  return response?.data;
});

export default {
  cacheUniqueStaffRoleBranches,
  verifyEmail,
  login,
  logout,
  clearUser,
  fetch,
};
