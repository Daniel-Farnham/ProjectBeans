import { getData, setData } from './dataStore';
import request from 'sync-request';

/**
  * Function to clear the data store object
  * @param {}  - no parameters required
  * @returns {} - returns empty object
*/
export function clearV1 (): Record<string, never> {
  const data = {
    users: [],
    channels: [],
    sessions: [],
    messageCount: 0,
  };
  setData(data);
  return {};
}

export type error = { error: string };

/**
  * Specifies the user interface (used for return types)
*/
export interface User {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}
/**
  * Specifies the user interface for user objects which contain all properties
  * including private properties
*/
export interface UserPrivate {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  password: string,
  permissionId: number,
}

/**
  * Specifies the channel interface (used for return types)
*/
export interface Channel {
  channelId: number;
  name: string;
  isPublic: boolean;
  ownerMembers: Array<User>;
  allMembers: Array<User>;
}

export type Messages = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number
};


/**
  * Parses the JSON response body into a string
*/
export const parseBody = (res: any) => {
  return JSON.parse(res.getBody() as string);
};

/**
  * Function used to create a post request
*/
export const postRequest = (url: string, data: any) => {
  const res = request(
    'POST',
    url,
    {
      json: data,
    }
  );
  return parseBody(res);
};
/**
  * Function used to create a put request
*/
export const putRequest = (url: string, data: any) => {
  const res = request(
    'PUT',
    url,
    {
      json: data,
    }
  );
  return parseBody(res);
};

/**
  * Function used to create a delete request
*/
export const deleteRequest = (url: string, data: any) => {
  const res = request(
    'DELETE',
    url,
    {
      qs: data,
    }
  );
  return parseBody(res);
};

/**
  * Function used to create a get request
*/
export const getRequest = (url: string, data: any) => {
  const res = request(
    'GET',
    url,
    {
      qs: data,
    }
  );
  return parseBody(res);
};

/**
  * Checks if the user id is registered in the database.
  * @param {number} userId - userId to check
  * @returns {Boolean} - returns true if exists, false otherwise
*/
export function userIdExists(userId: number): boolean {
  const data = getData();

  // Loop through users array to check if user exists
  for (const user of data.users) {
    if (user.uId === userId) {
      return true;
    }
  }
  return false;
}

/**
  * Checks if the channel id exists in the database.
  * @param {number} channelId - channelId to check
  * @returns {boolean} - true if channel exists, false otherwise
*/
export function channelIdExists(channelId: number): boolean {
  const data = getData();
  // Loop through channels array to check if channel exists
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }
  return false;
}
/**
  *  Check if a user is a member of a channel
  * @param {number} uId - uId to check
  * @param {number} channel - channel object
  *
  * @returns {boolean} - true if user is member, false otherwise
*/
export function isMemberOfChannel(channel: Channel, uId: number): boolean {
  // Loop through all members of channel
  // if user is found, then return true
  const allMembers = channel.allMembers;
  for (const member of allMembers) {
    if (member.uId === uId) {
      return true;
    }
  }
  return false;
}

/**
  *  Check if a user is an owner of a channel
  * @param {number} uId - uId to check
  * @param {number} channel - channel object
  *
  * @returns {boolean} - true if user is owner, false otherwise
*/
export function isOwnerOfChannel(channel: Channel, uId: number): boolean {
  // Loop through owner members of channel
  // if user is found, then return true
  const ownerMembers = channel.ownerMembers;
  for (const member of ownerMembers) {
    if (member.uId === uId) {
      return true;
    }
  }
  return false;
}

/**
  * Checks if the user id is registered in the database.
  * @param {string} token - userId to check
  * @returns {Boolean} - returns true if exists, false otherwise
*/
export function tokenExists (token: string): boolean {
  const data = getData();

  // Loop through sessions array to check if token exists
  for (const session of data.sessions) {
    if (session.tokens.includes(token)) {
      return true;
    }
  }
  return false;
}

/**
  * Generates a new messageId to be used for dms and messages
  * @param {} - no parameters required
  * @returns {newMessageId} - returns a new messageId
*/
export function getMessageId(): number {
  const data = getData();
  const newMessageId = data.messageCount;

  data.messageCount += 1;

  setData(data);

  return newMessageId;
}

export function getUidFromToken (token: string) {
  const data = getData();

  for (const session of data.sessions) {
    if (session.tokens.includes(token)) {
      return session.uId;
    }
  }
}
