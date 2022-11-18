import { postRequest, deleteRequest, getRequest, putRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

export function clearV1() {
  return deleteRequest(SERVER_URL + '/clear/v1', {});
}

export function authLoginV1(email: string, password: string) {
  return postRequest(SERVER_URL + '/auth/login/v3', { email, password });
}

export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  return postRequest(SERVER_URL + '/auth/register/v3', {
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
  });
}
export function dmCreateV1(token: string, uIds: any[]) {
  return postRequest(SERVER_URL + '/dm/create/v2', {
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

export function messageSendDmV1(token: string, dmId: number, message: string) {
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
  return getRequest(SERVER_URL + '/channel/messages/v3', {
    channelId: channelId,
    start: start,
  }, token);
}
export function channelJoinV1 (token: string, channelId: number) {
  return postRequest(SERVER_URL + '/channel/join/v3', {
    channelId: channelId
  }, token);
}
export function channelLeaveV1 (token: string, channelId: number) {
  return postRequest(SERVER_URL + '/channel/leave/v2', {
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
  return getRequest(SERVER_URL + '/dm/messages/v2', {
    dmId: dmId,
    start: start,
  }, token);
}
export function dmLeaveV1(token: string, dmId: number) {
  return postRequest(SERVER_URL + '/dm/leave/v2', {
    dmId: dmId
  }, token);
}
export function notificationsGetV1(token: string) {
  return getRequest(SERVER_URL + '/notifications/get/v1', {}, token);
}
export function messageReactV1 (token: string, messageId: number, reactId: number) {
  return postRequest(SERVER_URL + '/message/react/v1', { messageId, reactId }, token);
}
export function messageRemoveV1(token: string, messageId: number) {
  return deleteRequest(SERVER_URL + '/message/remove/v2', { messageId }, token);
}
export function searchV1 (token: string, queryStr: string) {
  return getRequest(SERVER_URL + '/search/v1', { queryStr }, token);
}
export function userProfileV1 (token: string, uId: number) {
  return getRequest(SERVER_URL + '/user/profile/v3', { uId }, token);
}
export function userProfileUploadPhotoV1 (token: string, imgUrl: string, xStart: number,
  yStart: number, xEnd: number, yEnd: number) {
  return postRequest(SERVER_URL + '/user/profile/uploadphoto/v1', { imgUrl, xStart, yStart, xEnd, yEnd }, token);
}
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  return postRequest(SERVER_URL + '/message/share/v1', {
    ogMessageId: ogMessageId,
    message: message,
    channelId: channelId,
    dmId: dmId,
  }, token);
}
export function messageUnreactV1 (token: string, messageId: number, reactId: number) {
  return postRequest(SERVER_URL + '/message/unreact/v1', { messageId, reactId }, token);
}
export function messagePinV1 (token: string, messageId: number) {
  return postRequest(SERVER_URL + '/message/pin/v1', { messageId }, token);
}
export function messageUnpinV1 (token: string, messageId: number) {
  return postRequest(SERVER_URL + '/message/unpin/v1', { messageId }, token);
}
export function adminUserRemoveV1(token: string, uId: number) {
  return deleteRequest(SERVER_URL + '/admin/user/remove/v1', { uId }, token);
}

export function usersAllV1(token: string) {
  return getRequest(SERVER_URL + '/users/all/v2', { }, token);
}
