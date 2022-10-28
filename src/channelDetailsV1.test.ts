import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

describe('Testing channelDetails', () => {
  beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });

  test('Successfully view channel details', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId.token,
      channelId: channel.channelId
    });

    const ExpectedChannelObj = {
      name: 'ChannelBoost',
      isPublic: true,
      ownerMembers:
    [
      {
        uId: userId.authUserId,
        email: 'daniel.farnham@student.unsw.edu.au',
        nameFirst: 'Daniel',
        nameLast: 'Farnham',
        handleStr: 'danielfarnham',
      }
    ],
      allMembers: [
        {
          uId: userId.authUserId,
          email: 'daniel.farnham@student.unsw.edu.au',
          nameFirst: 'Daniel',
          nameLast: 'Farnham',
          handleStr: 'danielfarnham',
        }
      ],
    };

    expect(ReturnedChannelObj).toMatchObject(ExpectedChannelObj);
  });

  test('Testing invalid authUserId', () => {
    const userId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: userId.token + 1,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId.token,
      channelId: channel.channelId
    });
    expect(ReturnedChannelObj).toMatchObject({ error: expect.any(String) });
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
      isPublic: true,
    });

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: userId.token,
      channelId: channel.channelId + 1
    });
    expect(ReturnedChannelObj).toMatchObject({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the channel', () => {
    const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'daniel.farnham@student.unsw.edu.au',
      password: 'AVeryPoorPassword',
      nameFirst: 'Daniel',
      nameLast: 'Farnham',
    });

    const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'fake.mcfake@student.unsw.edu.au',
      password: 'AnEvenWorsePassword',
      nameFirst: 'Fake',
      nameLast: 'McFake',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: user1.token,
      name: 'ChannelBoost',
      isPublic: true,
    });

    const ReturnedChannelObj = getRequest(SERVER_URL + '/channel/details/v2', {
      token: user2.token,
      channelId: channel.channelId
    });

    expect(ReturnedChannelObj).toMatchObject({ error: expect.any(String) });
  });
});
