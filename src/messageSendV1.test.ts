import { getRequest, postRequest, deleteRequest } from './other';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;



describe('Testing negative cases for messageSendV1'), () => {
    beforeEach(() => {
        deleteRequest(SERVER_URL + '/clear/v1', {}); 
    })


    test('Testing invalid token'), () => {
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
    
        const returnedMessagelObject = postRequest(SERVER_URL + 'message/send/v1', {
          token: userId.token + 1,
          channel: channel.channelId,
          message: "Hello this is a random test message"
        });
    
        // expect(returnedMessageObject.status).toStrictEqual(OK); 
        expect(returnedMessageObject).toMatchObject({ error: expect.any(String) });
    }

    test('Test invalid channelId', () => {
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
    
        const returnedMessagelObject = postRequest(SERVER_URL + 'message/send/v1', {
            token: userId.token,
            channel: channel.channelId + 1,
            message: "Hello this is a random test message"
        });

        // expect(returnedMessageObject.status).toStrictEqual(OK);
        expect(ReturnedMessageObject).toMatchObject({ error: expect.any(String) });
        });
  

    test('Authorised user is not a member of the channel', () => {
        const userId = postRequest(SERVER_URL + '/auth/register/v2', {
            email: 'daniel.farnham@student.unsw.edu.au',
            password: 'AVeryPoorPassword',
            nameFirst: 'Daniel',
            nameLast: 'Farnham',
        });
    
        postRequest(SERVER_URL + '/channels/create/v2', {
            token: userId.token,
            name: 'ChannelBoost',
            IsPublic: true,
        });

        const NonMemberChannel = postRequest(SERVER_URL + '/channels/create/v2', {
            token: userId.token,
            name: 'ChannelBoostWithoutDaniel',
            IsPublic: true,
        });
    
    
        // expect(returnedMessageObject.status).toStrictEqual(OK);
        expect(NonMemberChannel).toMatchObject({ error: expect.any(String) });
        });

    describe('Testing message is a valid length', () => {

        const userId = postRequest(SERVER_URL + '/auth/register/v2', {
            email: 'daniel.farnham@student.unsw.edu.au',
            password: 'AVeryPoorPassword',
            nameFirst: 'Daniel',
            nameLast: 'Farnham',
        });
    
        postRequest(SERVER_URL + '/channels/create/v2', {
            token: userId.token,
            name: 'ChannelBoost',
            IsPublic: true,
        });

        const messageGreaterThan1000Char = 'a'.repeat(1001)
        const messageLessThan1Char = '' 

        test.each([
            {
                token: userId.token,
                channel: channel.channelId + 1,
                message:  messageGreaterThan1000Char,
            },
            {
                token: userId.token,
                channel: channel.channelId + 1,
                message:  messageLessThan1Char,
            },
        ])
    })

    // Refer to test in channelCreate to do this. 
    test('Testing MessageId Uniqueness', () => {
        
        const userId = postRequest(SERVER_URL + '/auth/register/v2', {
            email: 'daniel.farnham@student.unsw.edu.au',
            password: 'AVeryPoorPassword',
            nameFirst: 'Daniel',
            nameLast: 'Farnham',
        });

         

    })
    




    





/*
    Negative cases (returns error) 
        1. channelId does not refer to a valid channel DONE 
        2. length of message is less than 1 
        3. length of message is over 1000 characters 
        4. channelId is valid and the user is not a member of the channel DONE
        5. token is invalid DONE
        6. Test that messageId is not shared with another message. 

    Positive cases (returns messageId)
        1. length of message is between 1 and 1000. 
        2. channelId is valid 
        3. token is invalid 


*/
}