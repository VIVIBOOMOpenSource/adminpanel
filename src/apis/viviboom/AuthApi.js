import axios from 'axios';
import Config from 'src/config';

async function login({ username, password }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/auth/login`, {
    username, password,
  });
}

async function logout({ authToken }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/auth/logout`, {
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function requestVerifyEmail({ authToken }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/email/request-verify`, {
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function requestVerifyEmailToken({ authToken }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/email/request-verify`, {
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function verifyEmail({ authToken, token }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/email/verify`, {
    token,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function requestResetPasswordToken({ email }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/password/request-reset`, {
    email,
  });
}

async function resetPassword({ authToken, token, password }) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/user/password/reset`, {
    token, password,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  login,
  logout,
  requestVerifyEmail,
  requestVerifyEmailToken,
  verifyEmail,
  requestResetPasswordToken,
  resetPassword,
};
