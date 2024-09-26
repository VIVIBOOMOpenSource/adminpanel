import axios from 'axios';
import Config from 'src/config';

async function postImage({
  authToken, file,
}) {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${Config.Common.ApiBaseUrl}/v2/editor/image`, formData, {
    headers: {
      'auth-token': authToken,
      'Content-Type': 'multipart/form-data',
    },
  });
}

export default {
  postImage,
};
