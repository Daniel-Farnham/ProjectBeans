import { deleteRequest } from './other';
import { port, url } from './config.json';
import { authRegisterV1, authPasswordResetRequestV1, authPasswordResetV1 } from './wrapperFunctions';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing basic authPasswordReset functionality', () => {
  test('Test successfully returns an empty object', () => {
    authRegisterV1('smth@ad.unsw.edu.au', 'password', 'bee', 'jennie');
    authPasswordResetRequestV1('smth@ad.unsw.edu.au');

    const result = authPasswordResetV1('1', 'newpassword');
    expect(result).toEqual({ });
  });

  test('Test error case if newPassword is too short', () => {
    authRegisterV1('smth@ad.unsw.edu.au', 'password', 'bee', 'jennie');
    authPasswordResetRequestV1('smth@ad.unsw.edu.au');
    const result = authPasswordResetV1('1', 'a');

    expect(result.statusCode).toEqual(400);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});
