import { getData, setData } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import { user } from './types';
import {
  userIdExists, tokenExists, error, getUidFromToken, FORBIDDEN,
  BAD_REQUEST, isMemberOfChannel, isMemberOfDm
} from './other';
import request from 'sync-request';
import fs from 'fs';
const sharp = require('sharp');
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

/**
  * Returns user object if a valid user is found
  *
  * @param {string} token - token session for user requesting profile
  * @param {number} uId - uId of user to search
  *
  * @returns {user} - Returns object with valid user ID, email, first name, last name,
  * and handle
*/
export function userProfileV1 (token: string, uId: number): error | { user: user } | any {
  // If either uId or token does not exist, then return error
  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!userIdExists(uId)) {
    throw HTTPError(400, 'uId to search is invalid');
  }

  // Retrieve user profile for matching user
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return {
        user: {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
          profileImgUrl: user.profileImgUrl,
        }
      };
    }
  }
}

/**
  * Returns object containing an array of user objects if valid token provided
  *
  * @param {string} token - token session for user requesting all users
  *
  * @returns { users } - Returns array of objects with valid user ID, email,
  *                      first name, last name, and handle string and handle
*/
export function usersAllV1 (token: string): error | {users: any[]} {
  // If token invalid, return error
  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is invalid');
  }
  const data = getData();

  const users = [];

  for (const user of data.users) {
    if (user.permissionId !== 10) {
      users.push(
        {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
        }
      );
    }
  }
  return { users };
}

/**
  * Set first and last name within a user's name properties and returns empty object
  * upon success
  *
  * @param {string} token - token session for user requesting change
  * @param {string} nameFirst - new firstName to change to
  * @param {string} nameLast - new lastName to change to
  *
  * @returns {{}} - Returns empty object upon successful handleStr change
*/
export function userProfileSetNameV1 (token: string, nameFirst: string, nameLast: string): error | Record<string, never> {
  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!validName(nameFirst) || !validName(nameLast)) {
    throw HTTPError(400, 'length of nameFirst/nameLast is not between 1 and 50');
  }

  const uId = getUidFromToken(token);

  // Update user profile for matching user with new names
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  // Update user profile within channels that they are a member of
  for (const channel of data.channels) {
    // Update for ownerMembers
    for (const member of channel.ownerMembers) {
      if (member.uId === uId) {
        member.nameFirst = nameFirst;
        member.nameLast = nameLast;
      }
    }
    // Update for allMembers
    for (const member of channel.allMembers) {
      if (member.uId === uId) {
        member.nameFirst = nameFirst;
        member.nameLast = nameLast;
      }
    }
  }

  // Update user profile with dms that they are a member of
  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.uId === uId) {
        member.nameFirst = nameFirst;
        member.nameLast = nameLast;
      }
    }
  }

  setData(data);
  return {};
}

/**
  * Set handelStr within a user's handleStr property and returns empty object
  * upon success
  *
  * @param {string} token - token session for user requesting change
  * @param {string} handleStr - new handleStr to change to
  *
  * @returns {{}} - Returns empty object upon successful handleStr change
*/
export function userProfileSetHandleV1 (token: string, handleStr: string): error | Record<string, never> {
  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (handleInUse(handleStr)) {
    throw HTTPError(400, 'handle already in use');
  }

  // Check if handle is valid, if not, then return error appropriate
  // error messages
  const notAlphanumeric = /[^A-Za-z0-9]/;
  if (notAlphanumeric.test(handleStr)) {
    throw HTTPError(400, 'handle is not alphanumeric');
  }
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'Handle is not between 3 and 20 characters in length');
  }

  const data = getData();
  // Update user profile for matching user with new handle
  const uId = getUidFromToken(token);
  for (const user of data.users) {
    if (user.uId === uId) {
      user.handleStr = handleStr.toLowerCase();
    }
  }
  // Update user profile within channels that they are a member of
  for (const channel of data.channels) {
    // Update for ownerMembers
    for (const member of channel.ownerMembers) {
      if (member.uId === uId) {
        member.handleStr = handleStr;
      }
    }
    // Update for allMembers
    for (const member of channel.allMembers) {
      if (member.uId === uId) {
        member.handleStr = handleStr;
      }
    }
  }

  // Update user profile with dms that they are a member of
  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.uId === uId) {
        member.handleStr = handleStr;
      }
    }
  }

  setData(data);
  return {};
}

/**
  * Set e-mail within a user's e-mail property
  *
  * @param {string} token - token session for user requesting change
  * @param {string} email - new e-mail address to change to
  *
  * @returns {{}} - Returns empty object upon successful email change
*/
export function userProfileSetEmailV1 (token: string, email: string): error | Record<string, never> {
  if (!tokenExists(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (!(validator.isEmail(email))) {
    throw HTTPError(400, 'Invalid email address entered');
  }

  if (emailInUse(email)) {
    throw HTTPError(400, 'E-mail already in use');
  }

  // Update user profile for matching user with new email address
  const uId = getUidFromToken(token);

  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      user.email = email.toLowerCase();
    }
  }
  // Update user profile within channels that they are a member of
  for (const channel of data.channels) {
    // Update for ownerMembers
    for (const member of channel.ownerMembers) {
      if (member.uId === uId) {
        member.email = email;
      }
    }
    // Update for allMembers
    for (const member of channel.allMembers) {
      if (member.uId === uId) {
        member.email = email;
      }
    }
  }

  // Update user profile with dms that they are a member of
  for (const dm of data.dms) {
    for (const member of dm.members) {
      if (member.uId === uId) {
        member.email = email;
      }
    }
  }

  setData(data);
  return {};
}

/**
  * Given a URL of an image on the internet, crops the image within bounds
  * of xStart, yStart and xEnd, yEnd at the top left
  *
  * @param {string} imgUrl - HTTP URL for image
  * @param {number} xStart - coordinate xStart
  * @param {number} yStart - coordinate yStart
  * @param {number} xEnd - coordinate xEnd
  * @param {number} yEnd - coordinate yEnd
  *
  * @returns {} - returns empty object upon success
*/
export function userProfileUploadPhotoV1 (token: string, imgUrl: string,
  xStart: number, yStart: number, xEnd: number, yEnd: number) {
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  const imgUrlIsJpg = /\.jpg$/;
  if (!imgUrlIsJpg.test(imgUrl)) {
    throw HTTPError(BAD_REQUEST, 'imgUrl is not a jpg file');
  }

  // HTTP get the image and throw error if response fails
  let response;
  try {
    response = request('GET', imgUrl);
  } catch (err) {
    throw HTTPError(BAD_REQUEST, 'Retrieving image from imgUrl failed');
  }
  // Generate a random string to use for the image file name
  const randomstring = require('randomstring');
  const randomString = randomstring.generate({ length: 25, charset: 'alphabetic' });

  // Store uncropped image onto static folder
  const imageFile = response.getBody();
  fs.writeFileSync(`static/uncropped${randomString}.jpg`, imageFile, { flag: 'w' });
  const sizeOf = require('image-size');

  // Check valid dimensions
  const dimensions = sizeOf(`static/uncropped${randomString}.jpg`);
  if (notWithinDimensions(dimensions.width, dimensions.height, xStart, yStart, xEnd, yEnd)) {
    throw HTTPError(BAD_REQUEST, 'any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image');
  }
  if (invalidEndCoordinates(xStart, yStart, xEnd, yEnd)) {
    throw HTTPError(BAD_REQUEST, 'coordinates xEnd <= xStart or yEnd <= yStart');
  }

  cropImage(`static/uncropped${randomString}.jpg`, `static/${randomString}.jpg`,
    xStart, yStart, xEnd, yEnd);

  setUserImgUrl(token, `${SERVER_URL}/static/${randomString}.jpg`);
  return {};
}

/**
  * Set user's imgUrl with new image
  *
  * @param {string} token - token of user to update image
  * @param {string} imgUrl - HTTP URL for image
  *
*/
function setUserImgUrl (token: string, imgUrl: string) {
  const uId = getUidFromToken(token);
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      user.profileImgUrl = imgUrl;
    }
  }
  setData(data);
}

/**
  * check whether dimensions are valid against an image's width and height
  *
  * @param {number} width - width of image
  * @param {number} height - height of image
  * @param {number} xStart - coordinate xStart
  * @param {number} yStart - coordinate yStart
  * @param {number} xEnd - coordinate xEnd
  * @param {number} yEnd - coordinate yEnd
  *
  * @returns boolean
*/
function notWithinDimensions(width: number, height: number, xStart: number,
  yStart: number, xEnd: number, yEnd: number) {
  if (xStart < 0 || yStart < 0 || xEnd < 0 || yEnd < 0) {
    return true;
  }
  if (xStart > width || yStart > height || xEnd > width || yEnd > height) {
    return true;
  }
  return false;
}

/**
  * Checks that the end coordinates are not less than or equal to start coordinates
  *
  * @param {number} xStart - coordinate xStart
  * @param {number} yStart - coordinate yStart
  * @param {number} xEnd - coordinate xEnd
  * @param {number} yEnd - coordinate yEnd
  *
  * @returns boolean
*/
function invalidEndCoordinates(xStart: number, yStart: number, xEnd: number, yEnd: number) {
  if (xEnd <= xStart) {
    return true;
  }
  if (yEnd <= yStart) {
    return true;
  }
}

/**
  * Crops image and stores cropped image in the /static/ folder
  * @param {string} imgUrl - HTTP URL for image to be cropped
  * @param {string} croppedImgUrl - HTTP URL for cropped image
  * @param {number} xStart - coordinate xStart
  * @param {number} yStart - coordinate yStart
  * @param {number} xEnd - coordinate xEnd
  * @param {number} yEnd - coordinate yEnd
  *
*/
async function cropImage(imgUrl: string, croppedImgUrl: string, xStart: number,
  yStart: number, xEnd: number, yEnd: number) {
  const width = xEnd - xStart;
  const height = yEnd - yStart;
  try {
    await sharp(imgUrl)
      .extract({ width: width, height: height, left: xStart, top: yStart })
      .toFile(croppedImgUrl);
  } catch (error) {
    console.log(error);
  }
}

/**
  * Checks if name is within 1 and 50 characters
  *
  * @param {string} name - token session for user requesting change
  *
  * @returns {boolean} - returns true if email in use
*/
function validName(name: string): boolean {
  if (name.length >= 1 && name.length <= 50) {
    return true;
  }
  return false;
}

/**
  * Checks if email is in use already
  *
  * @param {string} email - token session for user requesting change
  *
  * @returns {boolean} - returns true if email in use
*/
function emailInUse (email: string): boolean {
  const data = getData();

  for (const user of data.users) {
    if (user.email.toLowerCase() === email) {
      return true;
    }
  }
  return false;
}

/**
  * Checks if handleStr is in use already
  * @param {string} handleStr - token session for user requesting change
  *
  * @returns {boolean} - returns true if handle in use
  */
function handleInUse (handleStr: string): boolean {
  const data = getData();

  for (const user of data.users) {
    if (user.handleStr.toLowerCase() === handleStr.toLowerCase()) {
      return true;
    }
  }
  return false;
}

/**
  * Returns the required statistics about the workspace's use of the program
  * @param {string} token - token session for user requesting the stats
  *
  * @returns {workspaceStats} - returns true if handle in use
  */
export function usersStatsV1 (token: string) {
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  const data = getData();

  // Calculate the number of users that exist, and how many of them are in at
  // least one channel or dm
  const numUsersInChannelOrDm = findNumUsersInChannelOrDm();
  const numUsers = data.users.length;

  // Collect the timestamped analytics for channels, dms and messages then
  // calculate the utilization rate of the workspace
  const stats = {
    channelsExist: data.workspaceStats.channelsExist,
    dmsExist: data.workspaceStats.dmsExist,
    messagesExist: data.workspaceStats.messagesExist,
    utilizationRate: numUsersInChannelOrDm / numUsers
  };

  return { workspaceStats: stats };
}

/**
  * Calculates the number of users who have joined at least one channel
  * or dm
  * @returns {count} - number of users who are in at least one channel or dm
  */
function findNumUsersInChannelOrDm(): number {
  const data = getData();
  let count = 0;
  // For every registered user check if they are in any channels of dms
  for (const user of data.users) {
    let active = false;
    for (const channel of data.channels) {
      if (isMemberOfChannel(channel, user.uId)) {
        active = true;
      }
    }

    for (const dm of data.dms) {
      if (isMemberOfDm(dm, user.uId)) {
        active = true;
      }
    }

    // If they are increase the count of users in at least one channel or dm
    if (active) {
      count++;
    }
  }

  return count;
}
