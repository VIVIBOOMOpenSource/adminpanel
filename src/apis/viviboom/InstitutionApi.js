import axios from 'axios';
import Config from 'src/config';

async function deleteInstitution({ authToken, institutionId }) {
  return axios.delete(
    `${Config.Common.ApiBaseUrl}/v2/institution/${institutionId}`,
    {
      headers: { 'auth-token': authToken },
    },
  );
}

async function get({ authToken, institutionId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/institution/${institutionId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/institution`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({ authToken, institutionId, ...rest }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/institution/${institutionId}`,
    {
      ...rest,
    },
    {
      headers: { 'auth-token': authToken },
    },
  );
}

export default {
  deleteInstitution,
  get,
  getList,
  patch,
};
