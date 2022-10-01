import { channelJoinV1 } from './channel';
import { authLoginV1, authRegisterV1  } from './auth'
import { channelsListV1, channelsListAllV1} from './channels'
import { clear } from './other'



/*
beforeEach(() => {
    clearV1(); 
})

*/ 

test('Checking authId is valid', () => {
    const userID = authLoginV1();
    expect(typeof userID.authUserId).toBe('number'); //stub test, expecting auth.js to return a number if the user account is authenticated. 

});

describe('Checking ChannelId refers to a valid channel', () => {
    const channelArray = channelsListAllV1(); //Checking all channels. 
    test('Checking that channel to join is an object part of the channels array from the complete list of channelsListAllV1', () => {
        expect (typeof channelArray.channels).toBe('object'); 
    }); 

    /*

    Need to find way to access the objects in the channel array. 

    console.log(channelsListAllV1().channels.channelId);
    test('Checking that channel to join has channelId and name', () => {
    
        expect (typeof channelArray.channels.channelId).toBe('number'); 

        We are also assuming that the channelId is a positive integer. 
    
    });

    */ 
}); 

describe ('authenticated user is already a member of the channel', () => {
    const authID = authLoginV1()
    expect(typeof authID.authUserId).toBe('number'); //stub test, expecting channels.js to return a number if the user account is authenticated
});

describe ('authUserId is trying to join a private channel', () => { 
    //not sure on this test yet

}); 


/*

test('authenticated user is already a member of the channel', () => {
    const authID = authLoginV1()
    expect(typeof authID.authUserID).toBe('number'); //stub test, expecting channels.js to return a number if the user account is authenticated
});

test('authUserId is invalid', () => { 
    //not sure on this test yet

}); 

test('channelId refers to a channel that is private when the authorised user is not already a channel member/global owner', () => {

    //not sure on this one yet. 
}); 

*/



/* Some assumptions we are making. 

    That when implemented auth.js and channel.js will only return numbers. 
    That when implemented channel.js will exist. 


*/ 

