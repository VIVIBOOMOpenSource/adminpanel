import axios from 'axios';
import Config from 'src/config';

async function post({
  familyName,
  givenName,
  phone,
  email,
  eventId,
  ...rest
}) {
  return axios.post(`${Config.Common.ApiBaseUrl}/v2/booking/public`, {
    familyName,
    givenName,
    phone,
    email,
    eventId,
    ...rest,
  }, {});
}

export default {
  post,
};
