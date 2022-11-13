import { getData, setData } from './dataStore';
import validator from 'validator';
import { error, tokenExists } from './other';
import crypto from 'crypto';
import HTTPError from 'http-errors';

export function adminUserRemoveV1 (token: string, uId: number) {

  return ({})
}