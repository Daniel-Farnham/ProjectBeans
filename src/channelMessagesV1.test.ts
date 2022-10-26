import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;


beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
  });


describe('Testing basic functionality for channelMessagesV1', () => {
  test('Testing when start is 0 and messages is empty', () => {

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: newId.token,
      name: 'General',
      isPublic: false,
    });

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      token: newId.token,
      channelId: channel.channelId,
      start: 0, 
    }); 

    const messageObj = {
      messages: [],
      start: 0,
      end: -1
    };


    
    /* const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const channel = channelsCreateV1(newId.authUserId, 'General', false);
    const messages = channelMessagesV1(newId.authUserId, channel.channelId, 0);

    const messagesObj = {
      messages: [],
      start: 0,
      end: -1
    };
    */
    expect(messages).toMatchObject(messagesObj);
  });
});

describe('Testing channelMessagesV1 error handling', () => {
  test.each([
    {
      name: 'General',
      isPublic: true,
      uIdOffset: 0,
      channelIdOffset: 1,
      start: 0,
      desc: 'Testing an invalid channelId'
    },
    {
      name: 'Test',
      isPublic: false,
      uIdOffset: 0,
      channelIdOffset: 0,
      start: 1,
      desc: 'Testing when start is greater than number of messages'
    },
    {
      name: '1234',
      isPublic: true,
      uIdOffset: 1,
      channelIdOffset: 0,
      start: 0,
      desc: 'Testing an invalid authUserId'
    },
  ])('$desc', ({ name, isPublic, uIdOffset, channelIdOffset, start }) => {

    const newId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scully',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: newId.token,
      name: 'General',
      isPublic: false,
    });

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      token: newId.token + uIdOffset,
      channelId: channel.channelId + channelIdOffset,
      start: start, 
    }); 

    /* const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const channel = channelsCreateV1(newId.authUserId, name, isPublic);
    const messages = channelMessagesV1(newId.authUserId + uIdOffset, channel.channelId + channelIdOffset, start); */
    expect(messages).toMatchObject({ error: expect.any(String) });
  });

  test('Testing a user that isn\'t a member of the channel', () => {
    
    const firstId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'hayden.smith@unsw.edu.au',
      password: '123456',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
    });

    const secondId = postRequest(SERVER_URL + '/auth/register/v2', {
      email: 'z5361935@ad.unsw.edu.au',
      password: 'password',
      nameFirst: 'Curtis',
      nameLast: 'Scullyh',
    });

    const channel = postRequest(SERVER_URL + '/channels/create/v2', {
      token: firstId.token,
      name: 'ABD',
      isPublic: true,
    });

    const messages = getRequest(SERVER_URL + '/channel/messages/v2', {
      token: secondId.token,
      channelId: channel.channelId,
      start: 0, 
    }); 

   /*  const firstId = authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    const channel = channelsCreateV1(firstId.authUserId, 'ABD', true);
    const secondId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const messages = channelMessagesV1(secondId.authUserId, channel.channelId, 0); */
    expect(messages).toMatchObject({ error: expect.any(String) });
  });
});
