import { clearV1 } from './other';
import { userProfileV1 } from './users';
import { authLoginV1, authRegisterv1 } from './auth';

// Working cases
test('Testing successful return of user profile', () => {
  const userId = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
  const authUserId = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
  
  const expectedUser = {
    uId: authUserId,
    nameFirst: 'Hang',
    nameLast: 'Pham',
    email: 'hang.pham1@student.unsw.edu.au',
    handleStr: 'hangpham',
  };
  
  const resultUser = userProfileV1(authUserId, userId);
  expect(resultUser).toMatchObject(expectedUser);
});

describe('Fail cases', () => {
  // Clear data store and create new user
  beforeEach(() => {
    clearV1();
    const authUserId = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
  });
  
  test('uID to search does not exist', () => {
    const result = userProfileV1(authUserId, -1000);
    expect(result).toMatchObject({error: 'error'});
  });
  
  test('authUserId does not exist', () => {
    const result = userProfileV1(-1000, authUserId);
    expect(result).toMatchObject({error: 'error'});
  });

});