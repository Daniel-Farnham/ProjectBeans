import { getData, setData } from './dataStore';
import { tokenExists, FORBIDDEN, getUidFromToken, getHandleFromUid,
getNameFromChannelId, getNameFromDmId } from './other';
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
  
  const uId = getUidFromToken(token);
  // Loop through each notification and create reverse array so that the latest
  // notification is at the top
  for (const notification of data.notifications) {
    if (notification.uId === uId) {
      let notificationsUpToTwenty = [];
      let i = 0;
      for (const notificationToAdd of notification.notifications) {
        if (i < 20) {
          notificationsUpToTwenty.push(notificationToAdd);
        }
        i++;
      }
      return {notifications: notificationsUpToTwenty};
    }

  }
}

export function notificationSetAddChannel(channelId: number, authUserId: number, uId: number) {
  let name = getNameFromChannelId(channelId);
  let handle = getHandleFromUid(authUserId);

  const notificationMsg = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: `${handle} added you to ${name}`,
  };
  setNotificationForEachUser([uId], notificationMsg);
}

export function notificationSetAddDm(dmId: number, uId: number, uIds: any[]) {
  let name = getNameFromDmId(dmId);
  let handle = getHandleFromUid(uId);

  const notificationMsg = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: `${handle} added you to ${name}`,
  };
  console.log(notificationMsg);
  setNotificationForEachUser(uIds, notificationMsg);
}

export function notificationSetTag(uId: number, channelId: number, dmId: number, notificationMessage: string, type: string) {
  const senderHandle = getHandleFromUid(uId);
  let name;
  if (type === 'channel') {
    name = getNameFromChannelId(channelId);
  } else if (type === 'dm') {
    name = getNameFromDmId(dmId);
  }
  
  const notificationMsg = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: `${senderHandle} tagged you in ${name}: ${notificationMessage.substring(0, 20)}`,
  };

  // Loop through each uId and add notification
  let uIds = getUidsFromHandle(notificationMessage);
  setNotificationForEachUser(uIds, notificationMsg);
}
function setNotificationForEachUser(uIds: any[], notificationMsg: {}) {
  let data = getData();
  for (const uId of uIds) {
    for (let notification of data.notifications) {
      if (notification.uId === uId) {
        notification.notifications.unshift(notificationMsg);
      }
    }
  }
  setData(data);
}

function getUidsFromHandle(message: string): any[] {
  let data = getData();
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

export function requiresTagging(message: string) {
  const handleRegex = /@[A-Za-z0-9]+/;
  if (handleRegex.test(message)) {
    return true;
  }
  return false;
}

function requiresAddedNotification(message: string) {
  const handleRegex = /@[A-Za-z0-9]+/;
  if (handleRegex.test(message)) {
    return true;
  }
  return false;
}