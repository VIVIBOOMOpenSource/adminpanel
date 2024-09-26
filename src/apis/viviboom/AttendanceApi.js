import axios from 'axios';
import Config from 'src/config';

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/attendance`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function post({ authToken, branchId, ...rest }) {
  return axios.post(
    `${Config.Common.ApiBaseUrl}/v2/attendance`,
    {
      branchId,
      ...rest,
    },
    {
      headers: { 'auth-token': authToken },
    }
  );
}

async function patch({ authToken, attendanceId, ...rest }) {
  return axios.patch(
    `${Config.Common.ApiBaseUrl}/v2/attendance/${attendanceId}`,
    {
      ...rest,
    },
    {
      headers: { 'auth-token': authToken },
    }
  );
}

export default {
  getList,
  post,
  patch,
};
