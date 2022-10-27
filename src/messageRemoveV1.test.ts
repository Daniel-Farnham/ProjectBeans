import { putRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    deleteRequest(SERVER_URL + '/clear/v1', {});
});

describe('Testing messageDeleteV1 success', () => {
    test('Successfully edit message', () => {
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

          const message = postRequest(SERVER_URL + '/message/send/v1', {
            token: userId.token,
            channelId: channel.channelId,
            message: 'Hello this is a random test message'
          });

          const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
            token: userId.token, 
            messageId: message.messageId,
          });
          console.log(deletedMessage); 
          expect(deletedMessage).toStrictEqual({});
    });
});

describe('Testing messageDeleteV1 error handling', () => {
    test('Testing invalid token', () => {
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

          const message = postRequest(SERVER_URL + '/message/send/v1', {
            token: userId.token,
            channelId: channel.channelId,
            message: 'Hello this is a random test message'
          });
      
          const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
            token: userId.token + 'Invalid Token',
            messageId: message.messageId,
          });
          console.log(deletedMessage);
          expect(deletedMessage).toMatchObject({ error: expect.any(String) });
    });
    test('MessageId is invalid', () => {
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

          const message = postRequest(SERVER_URL + '/message/send/v1', {
            token: userId.token,
            channelId: channel.channelId,
            message: 'Hello this is a random test message'
          });
      
          const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
            token: userId.token,
            messageId: message.messageId + 1,
            message: 'This is an edited message'
          });
          console.log(deletedMessage);
          expect(deletedMessage).toMatchObject({ error: expect.any(String) });
    });
    test('Message not sent by authorised user and the user does not have the channel owner permission', () => {
        // user1 = the userId with owner permissions 
        const user1 = postRequest(SERVER_URL + '/auth/register/v2', {
            email: 'daniel.farnham@student.unsw.edu.au',
            password: 'AVeryPoorPassword',
            nameFirst: 'Daniel',
            nameLast: 'Farnham',
        });

        // user2 = the userId without owner permissions 
        const user2 = postRequest(SERVER_URL + '/auth/register/v2', {
            email: 'fake.mcfake@student.unsw.edu.au',
            password: 'AnEvenWorsePassword',
            nameFirst: 'Fake',
            nameLast: 'McFake',
        });

        // if user1 creates this channel, they have owner permissions. user2 won't have owner status. 
        const channel = postRequest(SERVER_URL + '/channels/create/v2', {
            token: user1.token,
            name: 'ChannelBoost',
            isPublic: true,
        });

        // a valid message is created by user 1 who is also the owner of the channel. 
        const message = postRequest(SERVER_URL + '/message/send/v1', {
            token: user1.token,
            channelId: channel.channelId,
            message: 'Hello this is a random test message'
        });

        // user 2 tries to edit the message. They neither have owner permissions of the channel and are not the authorised sender of the message dm. 
        const deletedMessage = deleteRequest(SERVER_URL + '/message/remove/v1', {
            token: user2.token,
            messageId: message.messageId,
            message: 'This is an edited message'
        });
        console.log(deletedMessage); 
        expect(deletedMessage).toMatchObject({ error: expect.any(String) });
    });  
});