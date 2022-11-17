import { postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
import { authRegisterV1 } from './wrapperFunctions';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

function authPasswordResetRequestV1(email: string) {
  return postRequest(SERVER_URL + '/auth/passwordreset/request/v1', { email });
}

describe('Testing basic authPasswordResetRequestV1 functionality', () => {
  test('Test successfully returns an empty object', () => {
    authRegisterV1('smth@ad.unsw.edu.au', 'password', 'bee', 'jennie');
    const result = authPasswordResetRequestV1('smth@ad.unsw.edu.au');
    expect(result).toEqual({ });
  });
});
