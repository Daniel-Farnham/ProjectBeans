import { getData, setData } from './dataStore.js'
import { userIdExists } from './other,js'
import { channelIdExists } from './other.js'

function channelDetailsV1(authUserId, channelId) {

  const data = getData(); 
  const findChannel = data.channels.find(o => o.channelId === channelId);
  
  //Check if userId or channelId is invalid. 
  if (!(userIdExists(authUserId)) || !(channelIdExists(channelId)) ) {
    return { error: 'userId or channelId is invalid' }
  }
  
  //Check if the user is the member of the channel. Return channel details if true, return error if false. 
  else {
    for (const channelMembers of findChannel.channelMembers) {
        if (channelMembers.uId === authUserId) { // Checking if the user is a member of the channel. 
          return {
            name: channels.name,
            isPublic: channels.isPublic,
            ownerMembers: channels.ownerMembers,
            allMembers: channels.allMembers
          }
        }
        else {
          return { error: 'user is already a part of the channel' }
        }
      }    
    }
}


function channelJoinV1(authUserId, channelId) {
    return {};
}

function channelInviteV1(authUserId, channelId, uId) {
    return {};
}

function channelMessagesV1(authUserId, channelId, start) {
    return {
        messages: [
          {
            messageId: 1,
            uId: 1,
            message: 'Hello world',
            timeSent: 1582426789,
          }
        ],
        start: 0,
        end: 50,
      };
}

export { channelDetailsV1 }; 
