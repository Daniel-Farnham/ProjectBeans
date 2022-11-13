import { getData, setData } from './dataStore';
import { tokenExists, FORBIDDEN } from './other';
import HTTPError from 'http-errors';

export interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

export type notifications = Array<Notification>;

/**
  * Returns user object if a valid user is found
  *
  * @param {string} token - token session for user requesting notifications
  *
  * @returns {notifications} - Returns array of objects containing notifications
  * where each object contains types { channelId, dmId, notificationMessage }
*/
export function notificationsGetV1(token: string) {
  const data = getData();
  
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }
  
  
  return { notifications:  data.notifications };
}

export function notificationSet(messageContainerId: number, message: string, type: string) {

  if (type === 'channel') {
    if (requiresTagging(message)) {
      notificationSetTag(messageContainerId, -1, message);
    }
  }
  
  if (type === 'dm') {
    if (requiresTagging(message)) {
      notificationSetTag(-1, messageContainerId, message);
    }
  }

}

function notificationSetTag(channelId: number, dmId: number, notificationMessage: string) {
  let data = getData();
  const notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: notificationMessage,
  };

  let uIds = getUidsFromHandle(notificationMessage);

  for (const uId of uIds) {
    for (let notification of data.notifications) {
      if (notification.uId === uId) {
        notification.notifications.push(notification);
      }
    }
  }
  setData(data);
}

function getUidsFromHandle(message: string): any[] {
  
  const handleRegex = /@[A-Za-z0-9]+/g;
  const handles = message.match(handleRegex);

  let handlesNoAt = handles.map(s => s.slice(1));
  const uIds = [];
  for (const handle of handlesNoAt) {
    for (const user of data.users) {
      if (user.handleStr === handle) {
        uIds.push(user.uId);
      }
    }
  }
  return uIds;
}

function requiresTagging(message: string) {
  const handleRegex = /@[A-Za-z0-9]+/;
  if (handleRegex.test(message)) {
    return true;
  }
  return false;
}