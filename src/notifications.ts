// import { getData } from './dataStore';
import { tokenExists } from './other';
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
  // const data = getData();

  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  return { notifications: [] };
}
