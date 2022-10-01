import { channelJoinV1 } from './channel';
import { authLoginV1 } from './auth'
import { authRegisterV1 } from './auth'
import { clear } from './other'
 
beforeEach(() => {
    clearV1(); 
})


test('Checking authId is valid', () => {

    expect(authId).toBe('number'); //stub test, expecting auth.js to return a number if the user account is authenticated. 

});

test('ChannelId refers to a valid channel', () => {
    expect(authId).toBe('number'); //stub test, expecting channels.js to return a number if the user account is authenticated
});

test('authUserId is invalid', () => { 
    //not sure on this test yet

}); 

test('channelId refers to a channel that is private when the authorised user is not already a channel member/global owner', () => {

    //not sure on this one yet. 
}); 

//Some assumptions we are making. That when implemented auth.js and channel.js will only return numbers. 



