import axios from 'axios';
import Config from 'src/config';

async function deleteBadgeCategory({ authToken, badgeCategoryId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/badge-category/${badgeCategoryId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/badge-category`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function post({ authToken, name, ...rest }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/badge-category`, {
    name,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function patch({ authToken, badgeCategoryId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/badge-category/${badgeCategoryId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  deleteBadgeCategory,
  getList,
  post,
  patch,
};
