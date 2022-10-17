import { getData, setData } from './dataStore';
import request from 'sync-request';

/**
  * Function to clear the data store object
  * @param {}  - no parameters required
  * @returns {} - returns empty object
*/
function clearV1 () {
  let data = {
    users: Array,
    channels: Array,
  };
  setData(data);
  return {};
}

export type error = { error: string };

/**
  * Specifies the channel interface
*/
export interface Channel {
  name: string;
  isPublic: boolean;
  ownerMembers: Array<User>;
  allMembers: Array<User>;
};

/**
  * Specifies the user interface
*/
export interface User {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handelStr: string;
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
function userIdExists(userId: number) {
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
function channelIdExists(channelId: number) {
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
function isMemberOfChannel(channel: Channel, uId: number) {
  const data = getData();
  // Loop through all members of channel 
  // if user is found, then return true
  let allMembers: Array<User>;
  allMembers = channel.allMembers;
  for (const member of allMembers) {
    if (member.uId === uId) {
      return true;
    }
  } 
  return false;
}

export { userIdExists, channelIdExists, clearV1, isMemberOfChannel };