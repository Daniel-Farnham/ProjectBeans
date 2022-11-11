import { postRequest, deleteRequest, getRequest, putRequest } from './other';
const SERVER_URL = `${url}:${port}`;

import { port, url } from './config.json';

export function clearV1() {
  return deleteRequest(SERVER_URL + '/clear/v1', {});
}
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return postRequest(SERVER_URL + '/auth/register/v2', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
  });
}
export function dmCreateV1(token: string, uIds: [any]) {
  return postRequest(SERVER_URL + '/dm/create/v1', {
    uIds: uIds,
  }, token);
}
export function channelsCreateV1(token: string, name: string, isPublic: boolean) {
  return postRequest(SERVER_URL + '/channels/create/v3', {
    name: name,
    isPublic: isPublic,
  }, token);
}
export function channelInviteV1(token: string, channelId: number, uId: number) {
  return postRequest(SERVER_URL + '/channel/invite/v3', {
    channelId: channelId,
    uId: uId
  }, token);
}

export function messageSendDmV1(token: string, dmId: number, message: string){
  return postRequest(SERVER_URL + '/message/senddm/v2', {
    dmId: dmId,
    message: message,
  }, token);
}
export function messageSendV1(token: string, channelId: number, message: string) {
  return postRequest(SERVER_URL + '/message/send/v2', {
    channelId: channelId,
    message: message,
  }, token);
}
export function channelMessagesV1(token: string, channelId: number, start: number) {
  return getRequest(SERVER_URL + '/channel/messages/v2', {
    channelId: channelId,
    start: 0,
  }, token);
};
export function channelJoinV1 (token: string, channelId: number) {
  postRequest(SERVER_URL + '/channel/join/v3', {
    channelId: channelId
  }, token);
}
export function channelLeaveV1 (token: string, channelId: number) {
  return postRequest(SERVER_URL + '/channel/leave/v1', {
    channelId: channelId
  }, token);
}
export function messageEditV1 (token: string, messageId: number, message: string) {
  return putRequest(SERVER_URL + '/message/edit/v2', {
    messageId: messageId,
    message: message
  }, token);
}
export function dmMessagesV1(token: string, dmId: number, start: number) {
  return getRequest(SERVER_URL + '/dm/messages/v1', {
    dmId: dmId,
    start: 0,
  }, token);
};
export function dmLeaveV1(token: string, dmId: number) {
  return postRequest(SERVER_URL + '/dm/leave/v1', {
    dmId: dmId
  }, token);
};
export function notificationsGetV1(token: string) {
  return getRequest(SERVER_URL + '/dm/messages/v1', {}, token);
};
export function messageReactV1 (token: string, messageId: number, reactId: number) {
  return postRequest(SERVER_URL + '/message/react/v1', {messageId, reactId}, token);
};
