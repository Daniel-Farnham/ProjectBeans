/*
import { channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels'
import { authRegisterV1 } from './auth'
import { clearV1 } from './other'
*/

// ^^ do we keep the above imports in? or do we just go entirely through sync-request?


import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;


describe('Testing channelDetails', () => {

/*
  beforeEach(() => {
    clearV1();
  });
*/ 

// Wrapper function, should take inputs token, channelId
function requestChannelDetails() {
  const res = request (
    'GET',
    `${url}:${port}/channel`,
    {
      // qs should contain name, isPublic, ownerMembers, allMembers?
      qs: {}
    }
  );
  const statusCode_string = res.statusCode.toString(); 
  return JSON.parse(statusCode_string as string);
}

test('successful connection', () => {
  expect(requestChannelDetails()).toBe(OK);
});


/*
  test('Successfully view channel details', () => {
    const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham');
    const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true); 
    const ReturnedChannelObj = channelDetailsV1(userId.authUserId, channel.channelId); //Should provide a valid channelId
    
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
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
      const ReturnedChannelObject = channelDetailsV1(userId.authUserId + 1, channel.channelId)
      
      expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
    });

    test('Testing invalid channelId', () => { 
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
      const ReturnedChannelObject = channelDetailsV1(userId.authUserId, channel.channelId + 1)  

      expect(ReturnedChannelObject).toMatchObject({ error: expect.any(String) }); 
    });

    test('Authorised user is not a member of the channel', () => {
      const userId = authRegisterV1('daniel.farnham@student.unsw.edu.au', 'AVeryPoorPassword', 'Daniel', 'Farnham')
      const channel = channelsCreateV1(userId.authUserId, 'ChannelBoost', true);
      const NonMemberChannel = channelsCreateV1(userId.authUserId, 'ChannelBoostWithoutDaniel', true); 
     
      expect(NonMemberChannel).toMatchObject({ error: expect.any(String) }); 

    });
*/

});