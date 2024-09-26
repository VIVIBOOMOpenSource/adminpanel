import axios from 'axios';
import Config from 'src/config';

async function get({ authToken, branchId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/branch/${branchId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/branch`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({ authToken, branchId, ...rest }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}`,
    {
      ...rest,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function patchGcalAuth({ authToken, branchId, code }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/gcal-auth`,
    {
      code,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function patchAdminGoogleAuth({ authToken, branchId, code }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/admin-google-auth`,
    {
      code,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function postUserStatusUpdate({ authToken, branchId }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/starter-badge/user-status-update`,
    {},
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function getStarterBadgesList({ authToken, branchId, ...params }) {
  return axios.get(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/starter-badge`,
    {
      headers: { 'auth-token': authToken },
      params,
    },
  );
}

async function postStarterBadge({
  authToken, branchId, badgeId, ...params
}) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/starter-badge/${badgeId}`,
    {
      branchId,
      badgeId,
    },
    {
      headers: { 'auth-token': authToken },
      params,
    },
  );
}

async function patchStarterBadge({ authToken, branchId, badges }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/starter-badge`,
    {
      badges,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function deleteStarterBadge({ authToken, branchId, badgeId }) {
  return axios.delete(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/starter-badge/${badgeId}`,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function postUserProjectCountUpdate({ authToken, branchId }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/update-user-project-count`,
    {
      withCredentials: true,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function postUserBadgeCountUpdate({ authToken, branchId }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/update-user-badge-count`,
    {
      withCredentials: true,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function postUserEventCountUpdate({ authToken, branchId }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}/update-user-event-count`,
    {
      withCredentials: true,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function deleteBranch({ authToken, branchId }) {
  return axios.delete(
    `${Config.Common.ApiBaseUrl}/v2/branch/${branchId}`,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function post({
  authToken, ...rest
}) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/branch`,
    {
      ...rest,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

export default {
  get,
  getList,
  patch,
  patchGcalAuth,
  patchAdminGoogleAuth,
  postUserStatusUpdate,
  getStarterBadgesList,
  postStarterBadge,
  deleteStarterBadge,
  patchStarterBadge,
  postUserProjectCountUpdate,
  postUserBadgeCountUpdate,
  postUserEventCountUpdate,
  deleteBranch,
  post,
};
