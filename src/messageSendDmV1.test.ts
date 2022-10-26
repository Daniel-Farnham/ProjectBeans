import { postRequest, deleteRequest, getRequest } from './other';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Before each test, clear dataStore
beforeEach(() => {
  deleteRequest(SERVER_URL + '/clear/v1', {});
});

// Working cases

describe('Testing messageSendDmV1 success case handling', () => {
  test('Testing successful return type for sending DM', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham1@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });
  
    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'jane.doe@student.unsw.edu.au',
      password: 'AP@ssW0rd!',
      nameFirst: 'Jane',
      nameLast: 'Doe',
    });
    
  
    const dm = postRequest(SERVER_URL + '/dm/create/v1', {
      token: user1.token,
      uIds: 
    });
    
  
   
  });
  // test.each([
  //   { token: '', uId: 100, desc: 'uID to search does not exist' },
  //   { token: 'InvalidToken', uId: 0, desc: 'token is invalid' },
  // ])('$desc', ({ token, uId }) => {
  //   const user = postRequest(SERVER_URL + '/auth/register/v2', {
  //     email: 'jane.doe@student.unsw.edu.au',
  //     password: 'AP@ssW0rd!',
  //     nameFirst: 'Jane',
  //     nameLast: 'Doe',
  //   });

  //   const result = getRequest(SERVER_URL + '/user/profile/v2', {
  //     token: user.token + token,
  //     uId: user.authUserId + uId,
  //   });

  //   expect(result).toStrictEqual(
  //     {
  //       error: expect.any(String),
  //     }
  //   );
  // });
});

// describe('Testing messageSendDmV1 error handling', () => {
//   test.each([
//     { token: '', uId: 100, desc: 'uID to search does not exist' },
//     { token: 'InvalidToken', uId: 0, desc: 'token is invalid' },
//   ])('$desc', ({ token, uId }) => {
//     const user = postRequest(SERVER_URL + '/auth/register/v2', {
//       email: 'jane.doe@student.unsw.edu.au',
//       password: 'AP@ssW0rd!',
//       nameFirst: 'Jane',
//       nameLast: 'Doe',
//     });

//     const result = getRequest(SERVER_URL + '/user/profile/v2', {
//       token: user.token + token,
//       uId: user.authUserId + uId,
//     });

//     expect(result).toStrictEqual(
//       {
//         error: expect.any(String),
//       }
//     );
//   });
// });
