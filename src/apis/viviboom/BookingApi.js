import axios from 'axios';
import Config from 'src/config';

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/booking`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function post({
  authToken, userId, eventId, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/booking`, {
    userId,
    eventId,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

/**
 * @param { authToken, bookingId, status, ...rest } param0 use status = BookingStatusType.CANCEL to cancel a booking
 * @returns promise of request
 */
async function patch({ authToken, bookingId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/booking/${bookingId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  getList,
  post,
  patch,
};
