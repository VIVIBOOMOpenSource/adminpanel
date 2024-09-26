import axios from 'axios';
import Config from 'src/config';

async function getWallet({ authToken, walletId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/wallet/${walletId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getWalletList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/wallet`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getReward({ authToken, rewardId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/reward/${rewardId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getRewardList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/reward`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getTransaction({ authToken, transactionId, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/transaction/${transactionId}`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function getTransactionList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/transaction`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function deleteReward({ authToken, rewardId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/reward/${rewardId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function deleteWallet({ authToken, walletId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/wallet/${walletId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function patchWallet({
  authToken, walletId, status, balanceDelta, clientRequestUuid,
}) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/wallet/${walletId}`, {
    status,
    balanceDelta,
    clientRequestUuid,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function postWallet({
  authToken, userId, status,
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/wallet`, {
    userId,
    status,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function patchReward({
  authToken, rewardId, amount,
}) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/reward/${rewardId}`, {
    amount,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function postReward({
  authToken, code, amount, expireAt,
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/reward`, {
    code,
    amount,
    expireAt,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  getWallet,
  getWalletList,
  getReward,
  getRewardList,
  getTransaction,
  getTransactionList,
  deleteReward,
  deleteWallet,
  patchWallet,
  postWallet,
  patchReward,
  postReward,
};