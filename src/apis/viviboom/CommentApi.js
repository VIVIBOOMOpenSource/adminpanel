import axios from 'axios';
import Config from 'src/config';

async function deleteComment({ authToken, commentId }) {
  return axios.delete(`${Config.Common.ApiBaseUrl}/v2/comment/${commentId}`, {
    headers: { 'auth-token': authToken },
  });
}

async function getList({ authToken, ...params }) {
  return axios.get(`${Config.Common.ApiBaseUrl}/v2/comment`, {
    headers: { 'auth-token': authToken },
    params,
  });
}

async function like({
  authToken, commentId, isLike, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/comment/like`, {
    commentId,
    isLike,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function patch({
  authToken, commentId, text, isFlagged, ...rest
}) {
  return axios.patch(`${Config.Common.ApiBaseUrl}/v2/comment/${commentId}`, {
    text,
    isFlagged,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

async function post({
  authToken, projectId, text, ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/comment`, {
    projectId,
    text,
    ...rest,
  }, {
    headers: { 'auth-token': authToken },
  });
}

export default {
  deleteComment,
  getList,
  like,
  patch,
  post,
};
