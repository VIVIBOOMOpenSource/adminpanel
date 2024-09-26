import axios from 'axios';
import Config from 'src/config';

async function deleteChallenge({ authToken, challengeId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/challenge/${challengeId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/challenge`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function get({ authToken, challengeId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/challenge/${challengeId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({ authToken, challengeId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/challenge/${challengeId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function post({
  authToken, createdByUserId, name, imageBase64, isPublished, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/challenge`, {
    createdByUserId, name, imageBase64, isPublished, ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function putImage({
  authToken, challengeId, file, imageType,
}) {
  const formData = new FormData();
  formData.append('file', file);

  return axios.put(`${Config.Common.ApiBaseUrl}/v2/challenge/${challengeId}/${imageType || 'image'}`, formData, {
    headers: {
      'auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });
}

export default {
  deleteChallenge,
  getList,
  get,
  post,
  patch,
  putImage,
};
