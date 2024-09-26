import axios from 'axios';
import Config from 'src/config';

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/vault`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function patch({
  authToken, vaultId, code, unlockCode, adminNotes,
}) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/vault/${vaultId}`, {
    code,
    unlockCode,
    adminNotes,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function post({
  authToken, code, ledServiceUUID, switchCharacteristicUUID, unlockCode, adminNotes,
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/vault`, {
    code,
    ledServiceUUID,
    switchCharacteristicUUID,
    unlockCode,
    adminNotes,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function deleteVault({ authToken, vaultId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/vault/${vaultId}`, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  getList,
  patch,
  post,
  deleteVault,
};
