import { getData, setData } from './dataStore';
import { getUidFromToken, tokenExists } from './other';
import HTTPError from 'http-errors';

/**
 *
 * @param {string} token
 * @param {number} uId
 * @returns
 */
export function adminUserRemoveV1 (token: string, uId: number) {
  const data = getData();
  if (!tokenExists(token)) {
    throw HTTPError(403, 'Token provided is invalid');
  }
  const globalUid = getUidFromToken(token);
  const global = data.users.find((user) => user.uId === globalUid);
  if (global.permissionId !== 1) {
    throw HTTPError(403, 'auth user provided is not global owner');
  }

  const remove = data.users.find((user) => user.uId === uId);
  if (typeof remove === 'undefined') {
    throw HTTPError(400, 'Not valid uId');
  }

  const globalOwnerNum = data.users.filter((user) => user.permissionId === 1);
  if (remove.permissionId === 1 && globalOwnerNum.length === 1) {
    throw HTTPError(400, 'Only global owner');
  }

  remove.permissionId = 10;
  remove.nameFirst = 'Removed';
  remove.nameLast = 'user';
  remove.email = 'Not a user - removed';
  remove.handleStr = '~RemovedUserRemovedUserRemovedUserRemovedUser~';
  remove.tokens = [];

  for (const channel of data.channels) {
    const removeChannel = channel.allMembers.find((member) => member.uId === uId);
    if (typeof removeChannel !== 'undefined') {
      removeChannel.nameFirst = 'Removed';
      removeChannel.nameLast = 'user';
      removeChannel.email = 'Not a user - removed';
      removeChannel.handleStr = '~RemovedUserRemovedUserRemovedUserRemovedUser~';
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
      removeDm.nameFirst = 'Removed';
      removeDm.nameLast = 'user';
      removeDm.email = 'Not a user - removed';
      removeDm.handleStr = '~RemovedUserRemovedUserRemovedUserRemovedUser~';
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
