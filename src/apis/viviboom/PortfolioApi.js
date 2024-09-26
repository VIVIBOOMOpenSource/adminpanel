import axios from 'axios';
import Config from 'src/config';

async function get({ authToken, portfolioId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/portfolio/${portfolioId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/portfolio`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({ authToken, portfolioId, ...fields }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/portfolio/${portfolioId}`,
    fields,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function post({ authToken, ...fields }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/portfolio`,
    fields,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function deletePortfolio({ authToken, portfolioId }) {
  return axios.delete(
    `${Config.Common.ApiBaseUrl}/v2/portfolio/${portfolioId}`,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function putImage({
  authToken, portfolioId, imageType, file,
}) {
  const data = new FormData();
  data.append('file', file);
  return axios.put(
    `${Config.Common.ApiBaseUrl}/v2/portfolio/${portfolioId}/${imageType}`,
    data,
    { headers: { 'auth-token': authToken } },
  );
}

export default {
  get,
  getList,
  patch,
  post,
  deletePortfolio,
  putImage,
};
