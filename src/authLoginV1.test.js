import { authLoginV1, authRegisterV1 } from './auth';
import { userProfileV1 } from './users';
import { clearV1 } from './other';

beforeEach (() =>  {
  clearV1();
});

describe('Testing basic authLoginV1 functionality', () => {
  test('Test that authLoginV1 successfully logs in and returns an integer Id', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const authId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    expect(authId).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test('Test uniqueness of Ids when logging into registered accounts', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const firstId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    const secondId = authLoginV1('hayden.smith@unsw.edu.au', '123456');
    expect(firstId.authUserId).not.toBe(secondId.authUserId);
  });

  test('Test authRegisterV1 and authLoginV1 return the same Id for the same account', () => {
    const regId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const loginId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    expect(regId.authUserId).toBe(loginId.authUserId);
  });

  test('Test authLoginV1 and userProfileV1 return the same Id for the same account', () => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const loginId = authLoginV1('z5361935@ad.unsw.edu.au', 'password');
    const user = userProfileV1(loginId, loginId);
    expect(loginId.authUserId).toBe(user.uId);
  });
});

describe('Testing authLoginV1 error handling', () => {
  test.each([
    { email: 'notRegisteredEmail', password: 'password', desc: 'Testing an email that doesn\'t belong to a user' },
    { email: 'z5361935@ad.unsw.edu.au', password: '123456', desc: 'Testing an incorrect password for an existing email' },
    { email: 'hayden.smith@unsw.edu.au', password: 'drowssap', desc: 'Testing an email and password that both don\'t belong to a user' },
  ])('$desc', ({ email, password }) => {
    authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const authId = authLoginV1(email, password);
    expect(authId).toMatchObject({ error: 'error' });
  });
});