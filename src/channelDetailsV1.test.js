import { channelDetailsV1 } from './channel';
import { channelsListV1 } from './channels'
import { authLoginV1 } from './auth'
import { clear } from './other'

/* 

    Given a channel with ID channelId that the authorised user is a member of, provides basic details about the channel.

*/ 

// Checking authUserId is valid. 

test('Checking authId is valid', () => {
    const userID = authLoginV1();
    expect(typeof userID.authUserId).toBe('number'); //stub test, expecting auth.js to return a number if the user account is authenticated. 

});


// test to check that the authenticated user is part of the channel. 


// channelId does not refer to a valid channel. 