import { clearV1 } from './other';
import { channelsCreateV1 } from './channels';
import { channelInviteV1, channelDetailsV1 } from './channel';
import { authRegisterV1 } from './auth';

beforeEach(() => {
  clearV1();
});

describe('Working cases', () => {
  test('Successful return of empty object when executing channelInviteV1', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    const result = channelInviteV1(user1.authUserId, channel.channelId, user2.authUserId);

    expect(result).toMatchObject({});
  });

  test('User listed as member of channel after being invited to the channel', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    channelInviteV1(user1.authUserId, channel.channelId, user2.authUserId);

    const result = channelDetailsV1(user2.authUserId, channel.channelId);
    const expectedResult = {
      name: "General",
      isPublic: true,
      ownerMembers: [ 
        {
          uId: user1.authUserId,
          nameFirst: 'Hang',
          nameLast: 'Pham',
          email: 'hang.pham1@student.unsw.edu.au',
          handleStr: 'hangpham',  
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          nameFirst: 'Hang',
          nameLast: 'Pham',
          email: 'hang.pham1@student.unsw.edu.au',
          handleStr: 'hangpham',  
        },
        {
          uId: user2.authUserId,
          nameFirst: 'Jane',
          nameLast: 'Doe',
          email: 'jane.doe@student.unsw.edu.au',
          handleStr: 'janedoe',  
        },
      ],
    }; 
    expect(result).toMatchObject(expectedResult);
  });
});

describe('Testing channelInviteV1 error handling', () => {
  test('channelId does not refer to a valid channel', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    const result = channelInviteV1(user1.authUserId, channel.channelId + 10, user2.authUserId);
    expect(result).toStrictEqual( {
        error: expect.any(String),
    });
  });

  test('uId does not refer to a valid user', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    const result = channelInviteV1(user1.authUserId, channel.channelId, user1.authUserId + user2.authUserId);
    
    expect(result).toStrictEqual( {
      error: expect.any(String),
    });
  });
  
  test('uId refers to a user who is already a member of the channel', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    const result = channelInviteV1(user1.authUserId, channel.channelId, user1.authUserId);
    
    expect(result).toStrictEqual( {
      error: expect.any(String),
    });
  });
  
  test('channelId is valid and the authorised user is not a member of the channel', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const user3 = authRegisterV1('stella.jones@student.unsw.edu.au', 'AP@ssW0rd!', 'Stella', 'Jones');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    const result = channelInviteV1(user3.authUserId, channel.channelId, user2.authUserId);

    expect(result).toStrictEqual( {
      error: expect.any(String),
    });
  });

  test('authUserId is invalid', () =>{
    const user1 = authRegisterV1('hang.pham1@student.unsw.edu.au', 'AP@ssW0rd!', 'Hang', 'Pham');
    const user2 = authRegisterV1('jane.doe@student.unsw.edu.au', 'AP@ssW0rd!', 'Jane', 'Doe');
    const channel = channelsCreateV1(user1.authUserId, "General", true);
    const result = channelInviteV1(user1.authUserId + user2.authUserId, channel.channelId, user2.authUserId);

    expect(result).toStrictEqual( {
      error: expect.any(String),
    });
  });
});