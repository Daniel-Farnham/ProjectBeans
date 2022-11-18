import { FORBIDDEN, BAD_REQUEST, postRequest, getRequest, channelIdExists, getUidFromToken } from './other';
import {
  clearV1, authRegisterV1, notificationsGetV1, dmCreateV1, channelMessagesV1,
  channelsCreateV1, messageSendV1, messageReactV1, channelJoinV1, messageSendDmV1,
  dmMessagesV1, userStatsV1, channelLeaveV1
} from './wrapperFunctions';

import { port, url } from './config.json';
import { token } from 'morgan';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  clearV1();
});


describe('Testing userStatsV1 success handling', () => {
	test('Testing userStatsV1 returns correct output (simple)', () => {
		const user = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
		const channel = channelsCreateV1(user.token, 'Channel1', true);
		const timeSent = Math.floor((new Date()).getTime()/1000);
		messageSendV1(user.token, channel.channelId, 'Hello nobody');
		const timeSent2 = Math.floor((new Date()).getTime()/1000);

		const result = userStatsV1(user.token);
		
    expect(result).toMatchObject({
			userStats: {
				channelsJoined: [{numChannelsJoined: 0, timeStamp: 0}, {numChannelsJoined: 1, timeStamp: timeSent}],
    		dmsJoined: [{numDmsJoined: 0, timeStamp: 0}], 
    		messagesSent: [{MessagesSent: 0, timeStamp: 0}, {MessagesSent: 1, timeStamp: timeSent2}], 
    		involvementRate: 1, 
			}
		})
  });
	test('Testing userStatsV1 returns correct output (complex)', () => {
		const user = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
		const user2 = authRegisterV1('joep@what.com', 'password', 'Joe', 'Pan');
		const user3 = authRegisterV1('jeffbrown@hotmail.com', 'password', 'Jeff', 'Brown');

		const channel = channelsCreateV1(user.token, 'Channel1', true);
		channelJoinV1(user2.token, channel.channelId);
		const time = Math.floor((new Date()).getTime()/1000);
		

		const channel2 = channelsCreateV1(user2.token, 'Channel2', true);
		const time2 = Math.floor((new Date()).getTime()/1000);
		channelJoinV1(user.token, channel2.channelId);

		const uId2 = getUidFromToken(user2.token);
		const uId3 = getUidFromToken(user3.token);

		const newDm = dmCreateV1(user.token, [uId2, uId3]);
		const time3 = Math.floor((new Date()).getTime()/1000);

		messageSendV1(user2.token, channel.channelId, 'Hey!!!');
		const time4 = Math.floor((new Date()).getTime()/1000);
		messageSendV1(user2.token, channel2.channelId, 'Hey in the 2nd channel');
		const time5 = Math.floor((new Date()).getTime()/1000);
		messageSendDmV1(user2.token, newDm.dmId, 'Hey in dms');
		const time6 = Math.floor((new Date()).getTime()/1000);

		channelsCreateV1(user3.token, 'Another_channel', true);

		const result = userStatsV1(user2.token);
		
    expect(result).toMatchObject({
			userStats: {
				channelsJoined: [{numChannelsJoined: 0, timeStamp: 0}, {numChannelsJoined: 1, timeStamp: time}, 
					{numChannelsJoined: 2, timeStamp: time2}],
    		dmsJoined: [{numDmsJoined: 0, timeStamp: 0}, {numDmsJoined: 1, timeStamp: time3}], 
    		messagesSent: [{MessagesSent: 0, timeStamp: 0}, {MessagesSent: 1, timeStamp: time4}, {MessagesSent: 2, timeStamp: time5}, 
					{MessagesSent: 3, timeStamp: time6}], 
    		involvementRate: 6/7, 
			}
		})
  });
	test('User joins 2 channels and leaves 1', () => {
		const user = authRegisterV1('jackblack@gmail.com', 'password', 'Jack', 'Black');
		const channel = channelsCreateV1(user.token, 'Channel1', true);
		const time = Math.floor((new Date()).getTime()/1000);

		const user2 = authRegisterV1('jp@gmail.com', 'pass', 'Joe', 'Pe');
		const channel2 = channelsCreateV1(user2.token, 'Channel2', true);

		channelJoinV1(user.token, channel2.channelId);
		const time2 = Math.floor((new Date()).getTime()/1000);

		channelLeaveV1(user.token, channel2.channelId);
		const time3 = Math.floor((new Date()).getTime()/1000);

		const result = userStatsV1(user.token);
		
    expect(result).toMatchObject({
			userStats: {
				channelsJoined: [{numChannelsJoined: 0, timeStamp: 0}, {numChannelsJoined: 1, timeStamp: time},
					{numChannelsJoined: 2, timeStamp: time2}, {numChannelsJoined: 1, timeStamp: time3}],
    		dmsJoined: [{numDmsJoined: 0, timeStamp: 0}], 
    		messagesSent: [{MessagesSent: 0, timeStamp: 0}], 
    		involvementRate: 2/3, 
			}
		})
  });
});

describe('Testing userStatsV1 error handling', () => {
	test('Testing userStatsV1 returns error when token is invalid', () => {
    const result = userStatsV1('invalidtoken');

    expect(result.statusCode).toBe(FORBIDDEN);
    const bodyObj = JSON.parse(result.body as string);
    expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  });
});