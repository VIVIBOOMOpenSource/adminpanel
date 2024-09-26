import InstitutionApi from 'src/apis/viviboom/InstitutionApi';
import { set, clear } from './index';
import store from '../store';

const fetch = async () => store.dispatch(async (dispatch) => {
  const { institution, user } = store.getState();
  const { authToken } = user;
  let response;
  try {
    response = await InstitutionApi.get({ authToken, institutionId: user?.institutionId });
  } catch (e) {
    console.error(e);
  }
  dispatch(set({ ...institution, ...response.data.institution }));
  return response?.data;
});

const save = (data) => store.dispatch((dispatch) => {
  dispatch(set(data));
});

const clearInstitution = () => store.dispatch((dispatch) => {
  dispatch(clear());
});

export default {
  fetch,
  save,
  clearInstitution,
};
