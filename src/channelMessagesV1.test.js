import { authRegisterV1 } from './auth';
import { channelMessagesV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { clearV1 } from './other';

beforeEach (() =>  {
  clearV1();
});

describe('Testing basic functionality for channelMessagesV1', () => {
  test('Testing when start is 0 and messages is empty', () => {
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const channel = channelsCreateV1(newId.authUserId, 'General', false);
    const messages = channelMessagesV1(newId.authUserId, channel.channelId, 0);

    const messagesObj = {
      messages: [],
      start: 0,
      end: -1
    };

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
    const newId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const channel = channelsCreateV1(newId.authUserId, name, isPublic);
    const messages = channelMessagesV1(newId.authUserId + uIdOffset, channel.channelId + channelIdOffset, start);
    expect(messages).toMatchObject({ error: expect.any(String) });
  });

  test('Testing a user that isn\'t a member of the channel', () => {
    const firstId = authRegisterV1('hayden.smith@unsw.edu.au', '123456', 'Hayden', 'Smith');
    const channel = channelsCreateV1(firstId.authUserId, 'ABD', true);
    const secondId = authRegisterV1('z5361935@ad.unsw.edu.au', 'password', 'Curtis', 'Scully');
    const messages = channelMessagesV1(secondId.authUserId, channel.channelId, 0);
    expect(messages).toMatchObject({ error: expect.any(String) });
  });
});