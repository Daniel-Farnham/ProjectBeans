import { getData, setData } from './dataStore';
import validator from 'validator';
import { error, tokenExists } from './other';
import crypto from 'crypto';
import HTTPError from 'http-errors';

/**
 * 
 * @param {string} token 
 * @param {number} uId 
 * @returns 
 */
export function adminUserRemoveV1 (token: string, uId: number) {
  let data = getData();
  if (!tokenExists(token)) {
    throw HTTPError(403, 'Token provided is invalid');
  }

  const user = data.users.find((user) => user.token.includes(token));
  if (user.permissionId !== 1) {
    throw HTTPError(403, 'auth user provided is not global owner');
  }

  const remove = data.users.find((user) => user.uId.includes(uId));
  if (typeof remove === 'undefined') {
    throw HTTPError(400, 'Not valid uId');
  }

  let globalOwnerNum = data.users.filter((user) => user.permissionId === 1); 
  if (remove.permissionId === 1 && globalOwnerNum.length === 1) {
    throw HTTPError(400, 'Only global owner');
  }

  remove.permissionId = 10; 
  remove.nameFirst = 'Removed'; 
  remove.nameLast = 'user';
  remove.email = 'Not a user - removed'; 
  remove.handleStr = 'Not a user';
  remove.tokens = [];

/*
Given a user by their uId, removes them from the Beans. This means they
should be removed from all channels/DMs, and will not be included in 
the array of users returned by users/all. Beans owners can remove other
Beans owners (including the original first owner). Once a user is removed,
the contents of the messages they sent will be replaced by 'Removed user'.
Their profile must still be retrievable with user/profile, however nameFirst
should be 'Removed' and nameLast should be 'user'. The user's email and handle
should be reusable.
*/

  return ({});
}

function adminErrorChecks (token: string, uId: number) {
  let data = getData();

}