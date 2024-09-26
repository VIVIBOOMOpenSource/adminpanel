import axios from 'axios';
import Config from 'src/config';

async function deleteEvent({ authToken, eventId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function get({ authToken, eventId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/event`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getResponse({ authToken, eventId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}/response`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getAttendanceResponse({ authToken, eventId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}/attendanceResponse`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function post({
  authToken, branchId, date, category, maxSlots, duration, isOnline, isFirstComeFirstServe, title, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/event`, {
    branchId, date, category, maxSlots, duration, isOnline, isFirstComeFirstServe, title, ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function patch({ authToken, eventId, ...rest }) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}`, {
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function postResponse({
  authToken, eventId, bookingId, responses, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}/response`, {
    bookingId,
    responses,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function postAttendanceResponse({
  authToken, eventId, attendanceId, responses, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}/attendanceResponse`, {
    attendanceId,
    responses,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function putImage({
  authToken, eventId, file,
}) {
  const formData = new FormData();
  formData.append('file', file);

  return axios.put(`${Config.Common.ApiBaseUrl}/v2/event/${eventId}/image`, formData, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  deleteEvent,
  get,
  getList,
  getResponse,
  getAttendanceResponse,
  patch,
  post,
  postResponse,
  postAttendanceResponse,
  putImage,
};
