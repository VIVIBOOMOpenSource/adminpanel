import axios from 'axios';
import Config from 'src/config';

async function getList({ ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/branch/public`, { params });
}

export default {
  getList,
};
