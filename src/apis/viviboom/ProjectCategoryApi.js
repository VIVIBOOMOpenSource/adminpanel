import axios from 'axios';
import Config from 'src/config';

async function deleteProjectCategory({ authToken, projectCategoryId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/project-category/${projectCategoryId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/project-category`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function post({ authToken, name, ...rest }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/project-category`, {
    name,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function patch({ authToken, projectCategoryId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/project-category/${projectCategoryId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  deleteProjectCategory,
  getList,
  post,
  patch,
};
