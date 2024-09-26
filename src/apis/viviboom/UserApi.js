import axios from 'axios';
import Config from 'src/config';

async function get({ authToken, userId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/user/${userId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/user`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getQuota({
  authToken, userId, month, year,
}) {
  return axios.get(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/booking-quota`,
    {
      headers: { 'auth-token': authToken },
      month,
      year,
    },
  );
}

async function patch({ authToken, userId, ...fields }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/user/${userId}`, fields, {
    headers: { 'auth-token': authToken },
  });
}

async function post({ authToken, ...fields }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user`, fields, {
    headers: { 'auth-token': authToken },
  });
}

async function postBulk({ authToken, ...fields }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/bulk`, fields, {
    headers: { 'auth-token': authToken },
  });
}

async function deleteUser({ authToken, userId, ...fields }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/user/${userId}`, {
    headers: { 'auth-token': authToken },
    data: fields,
  });
}

async function requestVerifyEmail({ authToken, email }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/user/email/request-verify`,
    { email },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function verifyEmail({ token }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/email/verify`, {
    token,
  });
}

async function passwordResetToken({ email }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/user/password/request-reset`,
    { email },
  );
}

async function passwordReset({ token, password }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/password/reset`, {
    token,
    password,
  });
}

async function putImage({
  authToken, userId, imageType, file,
}) {
  const data = new FormData();
  data.append('file', file);
  return axios.put(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/${imageType}`,
    data,
    {
      headers: {
        'auth-token': authToken,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

async function putRegistrationForm({ authToken, userId, file }) {
  const data = new FormData();
  data.append('file', file);
  return axios.put(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/registration-form`,
    data,
    {
      headers: {
        'auth-token': authToken,
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

async function getNotifications({ authToken, userId }) {
  return axios.get(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/notification`,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function updateNotifications({
  authToken,
  userId,
  notificationIds,
  seen,
  present,
}) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/notification`,
    {
      seen,
      present,
      notificationIds,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function getUserBookingQuota({
  authToken, userId, month, year,
}) {
  return axios.get(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/booking-quota`,
    {
      headers: { 'auth-token': authToken },
      params: { month, year },
    },
  );
}

async function postBadge({
  authToken, userId, badgeId, ...fields
}) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/badge/${badgeId}`,
    fields,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

// delete awarded starter badges or challenges
async function deleteAwardedBadge({ authToken, userId, userAwardedBadgeId }) {
  return axios.delete(
    `${Config.Common.ApiBaseUrl}/v2/user/${userId}/badge/${userAwardedBadgeId}`,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

export default {
  get,
  getList,
  getQuota,
  patch,
  post,
  postBulk,
  deleteUser,
  requestVerifyEmail,
  verifyEmail,
  passwordResetToken,
  passwordReset,
  getNotifications,
  putImage,
  putRegistrationForm,
  updateNotifications,
  getUserBookingQuota,
  postBadge,
  deleteAwardedBadge,
};
