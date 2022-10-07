import { userIdExists, channelIdExists } from './other.js';
import { getData, setData } from './dataStore.js';
import { userProfileV1 } from './users.js';

const GLOBAL_OWNER = 1; 

function channelDetailsV1(authUserId, channelId) {

  const data = getData(); 
  const findChannel = data.channels.find(o => o.channelId === channelId);
  
  //Check if userId and channelId is invalid. 
  if (userIdExists(authUserId) && channelIdExists(channelId)) {
    //Check if the user is the member of the channel. Return channel details if true, return error if false. 
    for (const allMembers of findChannel.allMembers) {
      // Checking if the user is a member of the channel. 
      if (allMembers.uId === authUserId) { 
        return {
          name: findChannel.name,
          isPublic: findChannel.isPublic,
          ownerMembers: findChannel.ownerMembers,
          allMembers: findChannel.allMembers
        }
      }
    }    
    // Case where authUserId is not a member of the channel
    return { error: 'authUserId is not a member of the channel' }
  } else {
    return { error: 'userId or channelId is invalid' }
  }
}

// Allows an authorised user to join a channel 
// Parameters authUserId, channelId
// Return: empty object or error message

function channelJoinV1(authUserId, channelId) {

  const data = getData();
  const findChannel = data.channels.find(o => o.channelId === channelId);
  
  //Check if userId or channelId are invalid
  if (!(userIdExists(authUserId)) || !(channelIdExists(channelId)) ) {
    return { error: 'userId or channelId is invalid' };
  }

  const findUser = data.users.find(o => o.uId === authUserId)
  
  //Check if member is not Global Owner and the channel is private. 
  if (!(findChannel.isPublic) && findUser.permissionId !== GLOBAL_OWNER) {
    return { error: 'Channel is private and user is not global owner or a member of the channel'}
  }

  //Check if user is already member of channel
  for (const allMembers of findChannel.allMembers) {
    if (allMembers.uId === authUserId) {
      return { error: 'User is already a member of the public channel' };
    }
  }

  const userObj = {
    uId: findUser.uId, 
    email: findUser.email,
    nameFirst: findUser.nameFirst,
    nameLast: findUser.nameLast,
    handleStr: findUser.handleStr,
  };

  //Loop through channel and add new member
  for (let channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.allMembers.push(userObj);
    }
  } 

  setData(data);
  return {};

}

// Invites a user to a channel with an authorised user
// Paramaters: authUserId, channelId, uId
// Return: empty object or error message

function channelInviteV1(authUserId, channelId, uId) {
  
  // If authUserId, uId and channelId are valid Ids
  if (userIdExists(authUserId) && userIdExists(uId) 
  && channelIdExists(channelId)) {
    let authUserExists = false;
    const data = getData(); 
    
    const allMembers = data.channels.find(o => o.channelId === channelId).allMembers;
    for (const member of allMembers) {
      // If authUserId exists in member list, then set authUserExists to true
      if (member.uId === authUserId) { 
        authUserExists = true;
      }
      
      // If user already exists as member, return error
      if (member.uId === uId) {
        return { error: "User to invite already a member of channel"};
      } 
    }
    // Invite new member to channel if authUserId is member of channel
    if (authUserExists) {
      const newMember = userProfileV1(authUserId, uId);
      let data = getData();
      // Loop through channel and add new member
      for (let channel of data.channels) {
        if (channel.channelId === channelId) {
          channel.allMembers.push(newMember.user);
          setData(data);
          return {};
        }
      } 
    } else {
      return { error: "authUserId is not a member of channel"};
    }
  } else {
    return { error : "authUserId/uId/channelId not valid" };
  }
}

/**
  * Returns up to 50 messages from a channel between index start and start + 50,
  * given that the authorised user is a member of the channel.
  * 
  * @param {number} authUserId - The authoirsed user trying to view messages
  * @param {number} channelId - The id of the channel that has the messages
  * @param {number} start - The starting index of the messages being viewed
  * 
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {{messages: array}} - An array of all the returned messages
  * @returns {{start: number}} - The starting index of the returned messages
  * @returns {{end: number}} - The final index of the returned messages
  */
function channelMessagesV1(authUserId, channelId, start) {
  // Check if the given information is valid
  const isInvalid = messagesInfoInvalid(authUserId, channelId, start);
  if (isInvalid !== false) {
    return isInvalid
  }

  // If start and number of messages are both 0, return empty message array
  const data = getData();
  const channel = data.channels.find(o => o.channelId === channelId);
  const numMessages = channel.messages.length;
  
  const messages = [];
  let end;
  if (start === 0 && numMessages === 0) {
    end = -1;
  } else {
    // If start and number of messages aren't both 0, add up to 50 messages
    for (let index = 0; index < numMessages && index < start + 50; index++) {
      messages.push(channel.messages[index]);
    }

    // Now determine if index is the least recent message or not
    if (index === numMessages) {
      end = -1;
    } else {
      end = index;
    }
  }

  return {
    messages: messages,
    start: start,
    end: end,
  };
}

/**
  * Checks if the channel information given is invalid
  * 
  * @param {number} authUserId - The authoirsed user trying to view messages
  * @param {number} channelId - The id of the channel that has the messages
  * @param {number} start - The starting index of the messages being viewed
  * 
  * @returns {{error: string}} - An error message if any parameter is invalid
  * @returns {boolean} - False if the information isn't invalid
  */
function messagesInfoInvalid(authUserId, channelId, start) {
  // If channelId or authUserId doesn't exist return error
  if (!(channelIdExists(channelId))) {
    return { error: 'ChannelId is invalid' };
  }
  if (!(userIdExists(authUserId))) {
    return { error: 'authUserId is invalid' };
  }

  // If start is negative or greater than number of messages return error
  if (start < 0) {
    return { error: 'Starting index can\'t be negative' };
  }
  const data = getData();
  const channel = data.channels.find(o => o.channelId === channelId);
  const numMessages = channel.messages.length;
  if (start > numMessages) {
    return { error: 'Start index is greater than number of messages in channel' };
  }

  // If channelId is valid but user isn't a member of the channel return error
  let isMember = false;
  for (const user of channel.allMembers) {
    if (user.uId === authUserId) {
      isMember = true;
    }
  }
  if (isMember === false) {
    return { error: 'Authorised user is not a member of the channel' };
  }

  // If no error by now, the info isn't invalid
  return false;
}

export { channelInviteV1, channelJoinV1, channelDetailsV1, channelMessagesV1 };
