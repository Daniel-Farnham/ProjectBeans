import { postRequest, deleteRequest, getRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const BAD_REQUEST = 400;
const FORBIDDEN = 403;

// Wrapper functions
function clearV1() {
  return deleteRequest(SERVER_URL + '/clear/v1', {});
}
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return postRequest(SERVER_URL + '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
  });
}
function dmCreateV1(token: string, uIds: []) {
  return postRequest(SERVER_URL + '/dm/create/v1', {
    uIds: uIds,
  }, token);
}
function messageSendDmV1(dmId: number, message: string, token: string) {
  return postRequest(SERVER_URL + '/message/senddm/v2', {
    dmId: dmId,
    message: message,
  }, token);
}
function messageSendV1(channelId: number, message: string, token: string) {
  return postRequest(SERVER_URL + '/message/send/v2', {
    channelId: channelId,
    message: message,
  }, token);
}
function channelMessagesV1(channelId: number, start: number, token: string) {
  return getRequest(SERVER_URL + '/channel/messages/v2', {
    channelId: channelId,
    start: 0,
  }, token);
};
function dmMessagesV1(token: string, dmId: number, start: number) {
  return getRequest(SERVER_URL + '/dm/messages/v1', {
    dmId: dmId,
    start: 0,
  }, token);
};
function notificationsGetV1(token: string) {
  return getRequest(SERVER_URL + '/dm/messages/v1', {}, token);
};

beforeEach(() => {
  clearV1();
});

describe('Testing notificationsGetV1 success handling', () => {

});

describe('Testing notificationsGetV1 error handling', () => {
  
});