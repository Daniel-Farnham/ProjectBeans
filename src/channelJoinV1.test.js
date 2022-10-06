import { channelJoinV1, channelDetailsV1 } from './channel';
import { authRegisterV1  } from './auth'
import { channelsCreateV1 } from './channels'
import { clearV1 } from './other'



describe('Testing channelJoin', () => {

    beforeEach(() => {
        clearV1(); 
    })


    test('Testing invalid authUserId', () => {
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
        const channel = channelsCreateV1(userId.authUserID, 'ChannelBoost', true);
        const ReturnedChannelObject = channelJoinV1(userId.authUserId + 1, channel.channelId);
        
        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
     
    });
    
      test('Testing invalid channelId', () => { 
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
        const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
        const ReturnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId + 1)  ;
        
        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
     
    });

      test('Testing if the user is already a member of the channel', () => {
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
        const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
        const ReturnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId);

        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) });  //expecting channelJoin to return error if the user is already a member. 

      });
 
      
      test('Testing if user is trying to join private channel assuming they are not global owner', () => {
        const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
        const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', false); 
        const ReturnedChannelObject = channelJoinV1(userId.authUserId, channel.channelId);
        
        expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String)});  

      });

}); 

