import { getData, setData } from './dataStore';
import {
  tokenExists, FORBIDDEN, getUidFromToken, getHandleFromUid,
  getNameFromChannelId, getNameFromDmId
} from './other';
import { Message, notification } from './types';
import HTTPError from 'http-errors';

export interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

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
      const notificationsUpToTwenty = [];
      let i = 0;
      for (const notificationToAdd of notification.notifications) {
        if (i < 20) {
          notificationsUpToTwenty.push(notificationToAdd);
        }
        i++;
      }
      return { notifications: notificationsUpToTwenty };
    }
  }
}

/**
  * Adds notification to a user when they were invited to a channel
  *
  * @param {number} channelId - channelId of channel user was added to
  * @param {number} authUserId - auth user who added the user
  * @param {number} uId - user who was invited to channel
  *
*/
export function notificationSetAddChannel(channelId: number, authUserId: number, uId: number) {
  const name = getNameFromChannelId(channelId);
  const handle = getHandleFromUid(authUserId);

  const notificationMsg = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: `${handle} added you to ${name}`,
  };
  setNotificationForEachUser([uId], notificationMsg);
}

/**
  * Adds notification to a user when they were invited to a dm
  *
  * @param {number} dmId - dmId of dm user was added to
  * @param {number} uId - auth user who invited the other users
  * @param {array of numbers} uIds - users who were invited to dm
*/
export function notificationSetAddDm(dmId: number, uId: number, uIds: any[]) {
  const name = getNameFromDmId(dmId);
  const handle = getHandleFromUid(uId);

  const notificationMsg = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: `${handle} added you to ${name}`,
  };
  setNotificationForEachUser(uIds, notificationMsg);
}

export function notificationSetReact(message: Message, uId: number, channelId: number, dmId: number, type: string) {
  const reactorHandle = getHandleFromUid(uId);
  let name;
  if (type === 'channel') {
    name = getNameFromChannelId(channelId);
  } else if (type === 'dm') {
    name = getNameFromDmId(dmId);
  }

  const notificationMsg = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: `${reactorHandle} reacted to your message in ${name}`,
  };
  setNotificationForEachUser([message.uId], notificationMsg);
}
/**
  * Adds notification to users when they are tagged within a message
  *
  * @param {number} uId - user who did the tagging
  * @param {number} channelId - channel that user was tagged in
  * @param {number} dmId - dm that user was tagged in
  * @param {string} notificationMessage - message that was created by user
  * @param {string} type - to check whether message came from a dm/channel
  *
*/
export function notificationSetTag(uId: number, channelId: number, dmId: number, notificationMessage: string, type: string) {
  const senderHandle = getHandleFromUid(uId);
  let name;
  if (type === 'channel') {
    name = getNameFromChannelId(channelId);
  } else if (type === 'dm') {
    name = getNameFromDmId(dmId);
  }

  const notificationMsg: notification = {
    channelId: channelId,
    dmId: dmId,
    notificationMessage: `${senderHandle} tagged you in ${name}: ${notificationMessage.substring(0, 20)}`,
  };

  // Loop through each uId and add notification
  const uIds = getUidsFromHandle(notificationMessage);
  setNotificationForEachUser(uIds, notificationMsg);
}
/**
  * Set datastore to contain new notifications for tagged users
  *
  * @param {number} uIds - users who were tagged in message
  * @param {{notification}} notificationMsg - Notification object containing details
  *
*/
function setNotificationForEachUser(uIds: any[], notificationMsg: notification) {
  const data = getData();
  for (const uId of uIds) {
    for (const notification of data.notifications) {
      if (notification.uId === uId) {
        notification.notifications.unshift(notificationMsg);
      }
    }
  }
  setData(data);
}

/**
  * Get user ids from handles that were tagged in am essage
  *
  * @param {string} message - message containing user handles
  *
*/
function getUidsFromHandle(message: string): any[] {
  const data = getData();
  // Strip out user handles, and emove the '@' from each handle
  const handleRegex = /@[A-Za-z0-9]+/g;
  const handles = message.match(handleRegex);
  const handlesNoAt = handles.map(s => s.slice(1));

  // Loop through users in datastore and generate an array containing
  // the valid users to be tagged
  let uIds = [];
  for (const handle of handlesNoAt) {
    for (const user of data.users) {
      if (user.handleStr === handle) {
        uIds.push(user.uId);
      }
    }
  }
  uIds = uIds.filter((val, i, array) => array.indexOf(val) === i);

  return uIds;
}

export function requiresTagging(message: string) {
  const handleRegex = /@[A-Za-z0-9]+/;
  if (handleRegex.test(message)) {
    return true;
  }
  return false;
}
