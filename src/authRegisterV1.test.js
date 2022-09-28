import { authRegisterV1 } from './auth';
import { userProfileV1 } from './users'
import { clear } from './other';

beforeEach(() => {
  clearV1();
});

describe('Testing basic authRegisterV1 functionality', () => {
  test('Test successful registration of new account', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    expect(typeof newId.authUserId).toBe('number');
  });
  
  test('Test user info is registered correctly', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    expect(userProfileV1(newId, newId)).toMatchObject({
      uId: newId,
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones',
      email: 'z5361935@ad.unsw.edu.au',
      handleStr: 'johnathonaugustusjon',
    });
  });
  
  test('Test user info is registered correctly when user handle is already taken', () => {
    const firstId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    const secondId = authRegisterV1('hayden.smith@unsw.edu.au', 'password', 'Johnathon', 'Augustus-Jones');
    expect(userProfileV1(secondId, secondId)).toMatchObject({
      uId: newId,
      nameFirst: 'Johnathon',
      nameLast: 'Augustus-Jones',
      email: 'hayden.smith@unsw.edu.au',
      handleStr: 'johnathonaugustusjon0',
    });
  });
});

describe('Testing authRegisterV1 error handling', () => {
  let newId = {};
  afterEach(() => {
    expect(newId).toMatchObject({ error: 'error' });
  });

  test('Testing registration with invalid email', () => {
    newId = authRegisterV1('notAnEmail', 'password', 'Curtis', 'Scully');
  });
  
  test('Testing registration with in use email', () => {
    const originalId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    newId = authRegisterV1('z5361935@ad.unsw.edu.au', '123456', 'Mike', 'Wazowski');
  });
  
  test('Testing registration with password too short', () => {
    newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'five', 'Curtis', 'Scully');
  });
  
  test('Testing registration with first name too short', () => {
    newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', '', 'Scully');
  });
  
  test('Testing registration with first name too long', () => {
    newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'ThisIsGoingToBeAVeryLongFirstNameWhichIsNotAllowedSinceItIsOverTheLimit', 'Scully');
  });
  
  test('Testing registration with last name too short', () => {
    newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', '');
  });
  
  test('Testing registration with last name too long', () => {
    newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'ThisIsGoingToBeAVeryLongLastNameWhichIsNotAllowedSinceItIsOverTheLimit');
  });
});