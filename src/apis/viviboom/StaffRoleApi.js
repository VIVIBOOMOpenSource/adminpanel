import axios from 'axios';
import Config from 'src/config';

async function getList({ authToken, branchIds }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/staff-role`, {
    headers: { 'auth-token': authToken },
    params: { branchIds },
  });
}

async function post({ authToken, name, branchId, staffRolePrivileges }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/staff-role`, {
    name, branchId, staffRolePrivileges,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function patch({ authToken, staffRoleId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/staff-role/${staffRoleId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function postUser({ authToken, staffRoleId, userId }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/staff-role/${staffRoleId}/user`, {
    userId,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function deleteUser({ authToken, staffRoleId, userId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/staff-role/${staffRoleId}/user/${userId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function deleteStaffRole({ authToken, staffRoleId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/staff-role/${staffRoleId}`, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  getList,
  post,
  patch,
  deleteStaffRole,
  postUser,
  deleteUser,
};
