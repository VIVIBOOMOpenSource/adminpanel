import Axios from 'axios';
import EnvironmentEnum from 'src/enums/environment';
import Config from '../config';

const supportedMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];

export var subscriptions = {};
export const request = async (
  name,
  endpoint,
  method,
  data,
  callback,
  retryAttemptsOpt,
  timeoutOpt,
) => {
  let retryAttempts = retryAttemptsOpt !== undefined ? retryAttemptsOpt : 1;
  const timeout = timeoutOpt !== undefined ? timeoutOpt : 60000;

  let endpointPass = Config.Common.ApiBaseUrl + endpoint;
  let localApiEndPoint = true;
  if (endpoint.includes('http')) {
    endpointPass = endpoint;
    localApiEndPoint = false;
  }

  if (!supportedMethods.includes(method)) {
    console.error('Ajax Request Error: Unrecognized Method: ', method);
    return false;
  }

  // Do not want to call the same request again
  // UnSub if you truly intend to recall something
  if (name in subscriptions) {
    return false;
  }

  const source = Axios.CancelToken.source();
  subscriptions[name] = {
    source,
  };

  if (Config.Env === EnvironmentEnum.Local) {
    if (endpointPass.includes('?')) {
      endpointPass += '&';
    } else {
      endpointPass += '?';
    }
    endpointPass += `lg=${localStorage.getItem('language')}`;
  }

  const axiosData = {
    cancelToken: source.token,
    async: true,
    method,
    timeout,
    headers: {},
    url: endpointPass,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  if (name.includes('cometchat')) {
    headers.appId = Config.Common.CometChatAppId;
    headers.apiKey = Config.Common.CometChatApiKey;
    headers.Accept = 'application/json';
  }

  if (localApiEndPoint) {
    if (localStorage.getItem('user')) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (
        user !== undefined
        && user.auth !== undefined
        && user.auth.id !== undefined
        && user.auth.token !== undefined
      ) {
        headers['auth-id'] = user.auth.id;
        headers['auth-token'] = user.auth.token;
      }
    }
  }

  if (method !== 'GET') {
    axiosData.data = data;
  }

  axiosData.headers = headers;

  Axios(axiosData)
    .then(async (response) => {
      if (response.data === undefined) {
        console.log('Error, response data null but came back 200', response);
        callback.catch({
          code: 1,
          message: 'Server Error: Then Response.data null',
        });
      } else {
        callback.then(response);
        callback.finally();
        await unSubRequest(name);
      }
    })
    .catch(async (error) => {
      if (Axios.isCancel(error)) {
        return false;
      }
      console.log(
        `Request catch error on name(${name}) response: `,
        error,
      );
      if (error.code === 'ECONNABORTED') {
        // On Timeout error
        retryAttempts -= 1;
        if (retryAttempts >= 1) {
          await unSubRequest(name);
          return await request(
            name,
            endpoint,
            method,
            data,
            callback,
            retryAttempts,
            timeoutOpt,
          );
        }
      }

      let err = {
        code: 1,
        message:
          'Request Error: Refresh the page to try again. Contact us if this continues. ',
      };
      if (
        error !== undefined
        && error.response !== undefined
        && error.response.data !== undefined
        && error.response.data.err !== undefined
      ) {
        err = error.response.data.err;
      }

      callback.catch(err);
      callback.finally();
      await unSubRequest(name);
    });
};

export const unSubRequest = async (name) => {
  if (name === 'all') {
    subscriptions = {};
    return;
  }

  if (name in subscriptions) {
    if (subscriptions[name].source !== undefined) {
      const { source } = subscriptions[name];
      await source.cancel();
    }
    await delete subscriptions[name];
  }
};
