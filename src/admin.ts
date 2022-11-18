import { getData, setData } from './dataStore';
import { getUidFromToken, tokenExists, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

/**
 * Removes an admin
 * 
 * @param {string} token
 * @param {number} uId
 * @returns {{}}
 */
export function adminUserRemoveV1 (token: string, uId: number) {
  const data = getData();
  if (!tokenExists(token)) {
    throw HTTPError(FORBIDDEN, 'Token provided is invalid');
  }
  const globalUid = getUidFromToken(token);
  const global = data.users.find((user) => user.uId === globalUid);
  if (global.permissionId !== 1) {
    throw HTTPError(FORBIDDEN, 'auth user provided is not global owner');
  }

  const remove = data.users.find((user) => user.uId === uId);
  if (typeof remove === 'undefined') {
    throw HTTPError(BAD_REQUEST, 'Not valid uId');
  }

  const globalOwnerNum = data.users.filter((user) => user.permissionId === 1);
  if (remove.permissionId === 1 && globalOwnerNum.length === 1) {
    throw HTTPError(BAD_REQUEST, 'Only global owner');
  }

  remove.permissionId = 10;
  remove.nameFirst = 'Removed';
  remove.nameLast = 'user';
  remove.email = 'Not a user - removed';
  remove.handleStr = '~RemovedUserRemovedUserRemovedUserRemovedUser~';
  for (const session of data.sessions) {
    if (session.uId === uId) {
      session.tokens = [];
    }
  }

  for (const channel of data.channels) {
    const removeChannel = channel.allMembers.find((member) => member.uId === uId);
    if (typeof removeChannel !== 'undefined') {
      channel.allMembers = channel.allMembers.filter((member) => member.uId !== removeChannel.uId);
      channel.ownerMembers = channel.ownerMembers.filter((member) => member.uId !== removeChannel.uId);
      for (const message of channel.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
    }
  }

  for (const dm of data.dms) {
    const removeDm = dm.members.find((member) => member.uId === uId);
    if (typeof removeDm !== 'undefined') {
      dm.members = dm.members.filter((member) => member.uId !== removeDm.uId);
      for (const message of dm.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
    }
  }

  setData(data);
  return ({});
}
