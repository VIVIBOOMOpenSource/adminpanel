import axios from 'axios';
import Config from 'src/config';

async function deleteBadge({ authToken, badgeId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/badge/${badgeId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/badge`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function get({ authToken, badgeId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/badge/${badgeId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({ authToken, badgeId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/badge/${badgeId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function post({
  authToken, createdByUserId, name, imageBase64, isPublished, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/badge`, {
    createdByUserId, name, imageBase64, isPublished, ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function putImage({
  authToken, badgeId, file, imageType,
}) {
  const formData = new FormData();
  formData.append('file', file);

  return axios.put(`${Config.Common.ApiBaseUrl}/v2/badge/${badgeId}/${imageType || 'image'}`, formData, {
    headers: {
      'auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });
}

export default {
  deleteBadge,
  getList,
  get,
  post,
  patch,
  putImage,
};
