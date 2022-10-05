import { channelJoinV1, channelDetailsV1 } from './channel';
import { authRegisterV1  } from './auth'
import { channelsCreateV1 } from './channels'
import { clear } from './other'



describe('Testing channelJoin', () => {

    beforeEach(() => {
        clearV1(); 
    })


    test('Testing invalid authUserId', () => {
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
        const channel = channelsCreateV1(userId, 'ChannelBoost', true);
        const ReturnedChannelObject = channelJoinV1(userId + 1, channel.channelId)
        
        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
     
    });
    
      test('Testing invalid channelId', () => { 
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
        const channel = channelsCreateV1(userId, 'ChannelBoost', true);
        const ReturnedChannelObject = channelJoinV1(userId, channel.channelId + 1)  
    
        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
     
    });

      test('Testing if the user is already a member of the channel', () => {
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
        const channel = channelsCreateV1(userId, 'ChannelBoost', true);
        const ReturnedChannelObject = channelJoinV1(userId, channel.channelId)

        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) });  //expecting channelJoin to return error if the user is already a member. 

      });

      test('Testing if user is trying to join private channel that they do not own', () => {
        
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
        const channel = channelsCreateV1(userId, 'ChannelBoost', false); //Creating private channel
        const ReturnedChannelObject = channelJoinV1(userId, channel.channelId)

        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String)});  

      });

}); 

