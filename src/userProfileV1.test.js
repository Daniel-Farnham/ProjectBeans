import { clearV1 } from './other';
import { userProfileV1 } from './users';
import { authLoginV1, authRegisterV1 } from './auth';

// Before each test, clear dataStore
beforeEach(() => {
  clearV1();
});

// Working cases
test('Testing successful return of user profile', () => {
  const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');

  const expectedUser = {
    user: {
      uId: user1.authUserId,
      email: 'hang.pham1@student.unsw.edu.au',
      nameFirst: 'Hang',
      nameLast: 'Pham',
      handleStr: 'hangpham',
    }
  };

  const resultUser = userProfileV1(user2.authUserId, user1.authUserId);
  expect(resultUser).toMatchObject(expectedUser);
});

describe('Testing userProfileV1 error handling', () => {
  test.each([
    { aUId: 0, uId: 100, desc: 'uID to search does not exist' },
    { aUId: 100, uId: 0, desc: 'authUserId does not exist' },
  ])('$desc', ({ aUId, uId }) => {
    const user = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const result = userProfileV1(user.authUserId + aUId, user.authUserId + uId);
    expect(result).toStrictEqual(
      {
        error: expect.any(String),
      }
    );
  });
});
