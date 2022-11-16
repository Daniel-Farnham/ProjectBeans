import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import { user } from './types';
import { authRegisterV1, authPasswordResetRequestV1 } from './wrapperFunctions';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic authPasswordResetRequestV1 functionality', () => {
  test('Test that authPasswordResetRequestV1 successfully logs in and returns an integer Id', () => {
    authRegisterV1('smth@ad.unsw.edu.au', 'password', 'bee', 'jennie');
    const result = authPasswordResetRequestV1('smth@ad.unsw.edu.au'); 
    expect(result).toStrictEqual({ });
  });
});