import axios from 'axios';
import Config from 'src/config';

async function getBoundaries({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/meraki/boundaries`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getSensorReadings({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/meraki/sensor`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

export default {
  getBoundaries,
  getSensorReadings,
}