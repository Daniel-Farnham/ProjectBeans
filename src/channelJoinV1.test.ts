import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('Testing positive cases for channelJoinV1', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

  test('Successful return of empty object when joining public channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user1.token,
      name: 'ChannelBoost',
      isPublic: true,
    });
    const returnedChannelObject = postRequest(SERVER_URL + '/channel/join/v2', {
      token: user2.token,
      channelId: channel.channelId
    });

    /*
    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.authUserId, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(user2.authUserId, channel.channelId);
    */
    expect(returnedChannelObject).toMatchObject({});
  });

  test('Successful return of empty object when joining private channel as global owner', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user2.token,
      name: 'ChannelBoost',
      IsPublic: false,
    });

    const returnedChannelObject = postRequest(SERVER_URL + '/channel/join/v2', {
      token: user1.token,
      channelId: channel.channelId
    });

    expect(returnedChannelObject).toMatchObject({});
  });

  test('User is added as a new member of allMembers array', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    // Creates a channel with 
    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user1.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const result = postRequest(SERVER_URL + '/channel/join/v2', {
      token: user2.token,
      channelId: channel.channelId,
    });
    
    const channelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: user1.token,
      channelId: channel.channelId
    });

    /*

    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');
    const channel = channelsCreateV1(user1.authUserId, 'ChannelBoost', true);
    channelJoinV1(user2.authUserId, channel.channelId);
    const channelObj = channelDetailsV1(user1.authUserId, channel.channelId);

    */
    const expectedChannelObj = {
      name: 'ChannelBoost',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'daniel.farnham@student.unsw.edu.au',
          nameFirst: 'Daniel',
          nameLast: 'Farnham',
          handleStr: 'danielfarnham',
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'daniel.farnham@student.unsw.edu.au',
          nameFirst: 'Daniel',
          nameLast: 'Farnham',
          handleStr: 'danielfarnham',
        },
        {
          uId: user2.authUserId,
          email: 'hang.pham@student.unsw.edu.au',
          nameFirst: 'Hang',
          nameLast: 'Pham',
          handleStr: 'hangpham',
        },
      ],
    };
    expect(channelObj).toMatchObject(expectedChannelObj);
  });
});

describe('Testing negative cases for channelJoinV1', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      IsPublic: true,
    });

    const returnedChannelObject = postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId.token + 1,
      channelId: channel.channelId
    });

    /*
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(userId.authUserId + 1, channel.channelId);
    */

    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) });
  });

  test('Testing invalid channelId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      IsPublic: true,
    });

    const returnedChannelObject = postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId.token,
      channelId: channel.channelId + 1,
    });

    /*
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId + 1);
    */

    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) });
  });

  test('Testing if the user is already a member of the channel', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      IsPublic: true,
    });

    const returnedChannelObject = postRequest(SERVER_URL + '/channel/join/v2', {
      token: userId.token,
      channelId: channel.channelId,
    });

    /*
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
    const returnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId);
    */

    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) }); // expecting channelJoin to return error if the user is already a member.
  });

  test('Testing if user is trying to join private channel assuming they are not global owner', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hang.pham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Hang',
      nameLast: 'Pham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user1.token,
      name: 'ChannelBoost',
      IsPublic: false,
    });

    const returnedChannelObject = postRequest(SERVER_URL + '/channel/join/v2', {
      token: user2.token,
      channelId: channel.channelId
    });

    /*

    const user1 = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const user2 = authRegisterV1('hang.pham@student.unsw.edu.au', 'AVeryPoorPassword', 'Hang', 'Pham');

    const channel = channelsCreateV1(user1.authUserId, 'ChannelBoost', false);
    const returnedChannelObject = channelJoinV1(user2.authUserId, channel.channelId);

    */
    expect(returnedChannelObject).toMatchObject({ error: expect.any(String) });
  });
});
