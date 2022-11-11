import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

export interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
};

export type notifications = Array<Notification>;

export function notificationsGetV1(token: string) {
  return {notifications: []};
}