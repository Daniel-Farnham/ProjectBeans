import { getData, setData } from './dataStore';
import { getHashOf, GLOBAL_SECRET } from './auth';
import request from 'sync-request';
import { Channel, datastore, dm, internalChannel, internalDm, Message } from './types';
/**
  * Function to clear the data store object
  * @param {}  - no parameters required
  * @returns {} - returns empty object
*/
export function clearV1 (): Record<string, never> {
  const data: datastore = {
    users: [],
    channels: [],
    sessions: [],
    messageCount: 0,
    tokenCount: 0,
    dms: [],
    notifications: [],
    resetCodeRequests: [],
    resetCode: 0,
    workspaceStats: {
      channelsExist: [],
      dmsExist: [],
      messagesExist: []
    },
    timeoutIds: []
  };
  setData(data);
  return {};
}

export type error = { error: string };
export type httpError = { code: number, error: string };
export const FORBIDDEN = 403;
export const BAD_REQUEST = 400;

/**
  * Parses the JSON response body into a string
*/
export const parseBody = (res: any) => {
  return JSON.parse(res.getBody() as string);
};

/**
  * Function used to create a post request
*/
export const postRequest = (url: string, data: any, token?: string) => {
  const res = request(
    'POST',
    url,
    {
      json: data,
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    return res;
  }
  return parseBody(res);
};
/**
  * Function used to create a put request
*/
export const putRequest = (url: string, data: any, token?: string) => {
  const res = request(
    'PUT',
    url,
    {
      json: data,
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    return res;
  }

  return parseBody(res);
};

/**
  * Function used to create a delete request
*/
export const deleteRequest = (url: string, data: any, token?: string) => {
  const res = request(
    'DELETE',
    url,
    {
      qs: data,
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    return res;
  }
  return parseBody(res);
};

/**
  * Function used to create a get request
*/
export const getRequest = (url: string, data: any, token?: string) => {
  const res = request(
    'GET',
    url,
    {
      qs: data,
      headers: { token: token }
    }
  );
  if (res.statusCode !== 200) {
    return res;
  }
  return parseBody(res);
};

/**
  * Loops for a given amount of time, in other words sleeps, pauses or waits
  * a certain period of time.
  * @param {number} time - The length of time to sleep in seconds
*/
export function sleep(time: number) {
  let timeSent = Math.floor((new Date()).getTime() / 1000);
  const timeFinish = timeSent + time;

  while (timeSent !== timeFinish) {
    timeSent = Math.floor((new Date()).getTime() / 1000);
  }
}

/**
  * Updates the message analytics
  * @param {number} timeSent - the time stamp of the analytics change
  */
export function updateMessageAnalytics(timeSent: number) {
  const data = getData();
  const index = data.workspaceStats.messagesExist.length;
  const numMsgs = data.workspaceStats.messagesExist[index - 1].numMessagesExist;
  data.workspaceStats.messagesExist.push({ numMessagesExist: numMsgs + 1, timeStamp: timeSent });
  setData(data);
}

/**
  * Checks if the user id is registered in the database.
  * @param {number} userId - userId to check

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
  * Checks if the dmid exists in the database.
  * @param {number} dmId - dmId to check
  * @returns {boolean} - true if dm exists, false otherwise
*/
export function dmIdExists(dmId: number): boolean {
  const data = getData();
  // Loop through dms array to check if dm exists
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
  return false;
}

/**
  *  Check if a user is a member of a channel
  * @param {number} channel - channel object
  * @param {number} uId - uId to check
  *
  * @returns {boolean} - true if user is member, false otherwise
*/
export function isMemberOfChannel(channel: internalChannel |Channel, uId: number): boolean {
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

  *  Check if a user is an owner of a message
  * @param {number} uId - uId to check
  * @param {object} message - message object
  *
  * @returns {boolean} - true if user ownns message, false otherwise
*/
export function isOwnerOfMessage(message: Message, uId: number): boolean {
  // check to see if the uId provided matches the uId stored in messages.
  const user = message.uId;
  if (user === uId) {
    return true;
  }
  return false;
}

/**

  *  Check if a user is an owner of a message
  * @param {number} uId - uId to check
  *
  * @returns {boolean} - true if user ownns message, false otherwise
  * @returns {object} - returns object containing information about whether the message exists in a channel or dm.
*/
export function getMessageContainer(messageId: number): boolean | any {
  const data = getData();

  // Loop through channel messages to check if messageId exists
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return {
          type: 'channel',
          channel: channel
        };
      }
    }
  }
  // Loop through dm messages to check if messageId exists
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return {
          type: 'dm',
          dm: dm
        };
      }
    }
  }
  return false;
}

/**
  *  Check if a user is a member of a dm
  * @param {number} dm - dm object
  * @param {number} uId - uId to check
  *
  * @returns {boolean} - true if user is member, false otherwise
*/
export function isMemberOfDm(dm: internalDm | dm, uId: number): boolean {
  // Loop through all members of dm
  // if user is found, then return true
  for (const member of dm.members) {
    if (member.uId === uId) {
      return true;
    }
  }
  return false;
}

/**
  * Check if a user is an owner of a channel
  *
  * @param {number} channel - channel object
  * @param {number} uId - uId to check
  * @returns {boolean} - true if user is owner, false otherwise
*/
export function isOwnerOfChannel(channel: internalChannel, uId: number): boolean {
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
  * Checks if the token is registered in the database.
  * @param {string} token - token to check
  * @returns {Boolean} - returns true if exists, false otherwise
*/
export function tokenExists (token: string): boolean {
  const data = getData();
  const hashedToken = getHashOf(token + GLOBAL_SECRET);

  // Loop through sessions array to check if token exists
  for (const session of data.sessions) {
    if (session.tokens.includes(hashedToken)) {
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

/**
  * Stores message in channel object and saves it to datastore
  *
  * @param {string} message - message to store
  * @param {number} channelId - id of channel to store
  * ...
  *
  * @returns - nothing to return
*/
export function storeMessageInChannel(message: Message, channelId: number) {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.messages.push(message);
    }
  }
  setData(data);
}

/**
  * Get a uId from a token
  * @param {string} token - token to check for userId
  * @returns {uId} - returns uId
*/
export function getUidFromToken (token: string): number {
  const data = getData();
  const hashedToken = getHashOf(token + GLOBAL_SECRET);
  for (const session of data.sessions) {
    if (session.tokens.includes(hashedToken)) {
      return session.uId;
    }
  }
}

/**
  * Get a handle from uId
  * @param {number} uId - token to check for userId
  * @returns {handleStr} - returns handleStr
*/
export function getHandleFromUid(uId: number) {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return user.handleStr;
    }
  }
}
/**
  * Get a channel name from channelId
  * @param {number} channelId - token to check for channelId
  * @returns {name} - returns name
*/
export function getNameFromChannelId(channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return channel.name;
    }
  }
}
/**
  * Get a channel object from channelId
  * @param {number} channelId - token to check for channelId
  * @returns {channel} - returns channel object
*/
export function getChannelObjectFromChannelId(channelId: number): internalChannel {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return channel;
    }
  }
}
/**
  * Get a dm object from dmId
  * @param {number} dmId - token to check for dmId
  * @returns {dm} - returns dm object
*/
export function getDmObjectFromDmlId(dmId: number): internalDm {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return dm;
    }
  }
}
/**
  * Get a dm name from dmId
  * @param {number} dmId - token to check for dmId
  * @returns {name} - returns name
*/
export function getNameFromDmId(dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return dm.name;
    }
  }
}
