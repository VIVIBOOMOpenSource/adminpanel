import axios from 'axios';
import Config from 'src/config';

async function deleteEventQuota({ authToken, eventQuotaId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/event-quota/${eventQuotaId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/event-quota`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({ authToken, eventQuotaId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/event-quota/${eventQuotaId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function post({
  authToken, countryISO, month, year, weekdays, weekends, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/event-quota`, {
    countryISO, month, year, weekdays, weekends, ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  deleteEventQuota,
  getList,
  patch,
  post,
};
