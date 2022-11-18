import { getData, setData } from './dataStore';
import { tokenExists, storeMessageInChannel, getMessageId, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST, getChannelObjectFromChannelId } from './other';
import HTTPError from 'http-errors';
import { channelJoinV1 } from './wrapperFunctions';
import { Message } from './types';
import { collapseTextChangeRangesAcrossMultipleVersions, createJSDocComment } from 'typescript';

const  MAX_MESSAGE_LEN = 1000; 
type timeFinish = {
  timeFinish: number | null,
}

type isActive = {
  isActive: boolean,

}

// let standup: Standup = {
//   messages: [],
//   timeFinish: -1,
// };


/**
  * Starts a given standup from a given channel. The standup time is specified by its length
  * and the standup is set to active. The standup deactivates at the end of length time.
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * @param {string} message
  * ...
  *
  * @returns {} returns an empty object
  */

export function standupSendV1 (token: string, channelId: number, message: string): error {

  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);

  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  if (message.length > MAX_MESSAGE_LEN) {
    throw HTTPError(BAD_REQUEST, 'length of message is over 1000 characters.');
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  if (standupActiveV1(token, channelId).isActive === false) {
    throw HTTPError(BAD_REQUEST, 'Active standup is not currently running in the channel');
  }
  
  const user = data.users.find(user => user.uId === uId); 
  const packagedMessage = user.handleStr + ': ' + message + '\n'; 
   
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standUp.messages.push(packagedMessage);
    }
  }
  
  // Testing, messages are successfully packaged. 
  // console.log(packagedMessage); 
  // console.log(standup.messages); 
  
  const timeFinish = standupActiveV1(token, channelId).timeFinish;
  
  // ## bug found here ## 
  // The problem is here. Each time a standUpSend is called a new message object is created with the packaged message. 
  // This should only be called once at the end. 
 
  if (Math.floor((new Date()).getTime() / 1000 < timeFinish)) {
    /*
    const standupMessages = standup.messages.join('')
    const standupMessageId = getMessageId(); 

    const messageObj = {
      messageId: standupMessageId,
      uId: uId, 
      message: standupMessages,
      timeStamp: timeFinish, 
    }

    storeMessageInChannel(messageObj, channelId); 
    */ 
  } 

  /* ########### Exists just for testing. ############# */
  /*for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const targetmessage of channel.messages) {
        console.log('Channel message: ' + targetmessage.message);
      }
      console.log(channel);
    }
  }*/
  

  return {}; 
} 

/*

  const user = data.users.find(user => user.uId === uId); 
  const packagedMessage = user.handleStr + ': ' + message + '\n'; 

  const timeFinish = standupActiveV1(token, channelId).timeFinish;
  
  if (Math.floor((new Date()).getTime() / 1000 < timeFinish)) {
  
    const standupMessages = standup.messages.join('')
    const standupMessageId = getMessageId(); 

    const messageObj = {
      messageId: standupMessageId,
      uId: uId, 
      message: packagedMessage,
      timeStamp: timeFinish, 
    }

    storeMessageInChannel(messageObj, channelId); 


    //let packagedStandup = packageStandUp(token, channelId, message);
    // using an object rather than an array might be best
 }

  const user = data.users.find(user => user.uId === uId); 
  const packagedMessage = user.handleStr + ': ' + message + '\n'; 
  
  standup.messages.push(packagedMessage);

  */


export function standupStartV1 (token: string, channelId: number, length: number): timeFinish | error {

  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);

  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'channelId is invalid');
  }

  if (length < 0) {
    throw HTTPError(BAD_REQUEST, 'standup length is invalid');
  }

  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  if (standupActiveV1(token, channelId).isActive === true) {
    throw HTTPError(BAD_REQUEST, 'Active standup already running in the channel');
  }
  
  const timeFinish = timeStandup(length);

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standUp.isActive = true;
      channel.standUp.timeFinish = timeFinish;
    }
  }
  
  setData(data);
  setTimeout(function() {
    const findChannel = data.channels.find(chan => chan.channelId === channelId);
    const standupMessages = findChannel.standUp.messages.join('');
    const standupMessageId = getMessageId(); 

    const messageObj: Message = {
      messageId: standupMessageId,
      uId: uId, 
      message: standupMessages,
      timeSent: timeFinish,
      reacts: [
        {
          reactId: 1,
          uIds: [],
          isThisUserReacted: false,
        }
      ],
      isPinned: false
    }

    storeMessageInChannel(messageObj, channelId); 
    deactivateStandup(channelId, timeFinish);
  }, (length * 1000));
  /* ########### Exists just for testing. ############# */
  // for (const channel of data.channels) {
  //   if (channel.channelId === channelId) {
  //     for (const targetmessage of channel.messages) {
  //       console.log('Channel message: ' + targetmessage.message);
  //     }
  //     console.log(channel);
  //   }
  // }
  
  return { timeFinish: timeFinish };
}

/**
  * Sums Current Time + length, returning time finish.
  *
  * @param {number} length
  * ...
  *
  * @returns {timeFinish}
  */

function timeStandup (length: number): number {
  const timeStart = Math.floor((new Date()).getTime() / 1000);
  const timeFinish = timeStart + length;

  return timeFinish;
}

/**
  * Deactivates the standup by setting isActive to false. This function is runs at TimeFinish.
  *
  * @param {number} length
  * @param {number} channelId
  * ...
  *
  */

function deactivateStandup(channelId: number, timeFinish: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId);
      if (channel.standUp.timeFinish >= timeFinish) {
        channel.standUp.isActive = false;
        channel.standUp.messages = []; 
        channel.standUp.timeFinish = null; 
      }
  }
  setData(data);
}

/**
  * Returns whether a standup from a given channel is active and
  * what time the standup finishes. If not active, the finish time
  * is null.
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * ...
  *
  * @returns {standupInfo} returns an object containing information
  * regarding whether the standup is active and its finish time
  */
export function standupActiveV1(token: string, channelId: number): isActive | timeFinish {
  if (!(tokenExists(token))) {
    throw HTTPError(FORBIDDEN, 'Token is invalid');
  }

  if (!channelIdExists(channelId)) {
    throw HTTPError(BAD_REQUEST, 'ChannelId is invalid');
  }

  const data = getData();
  const findChannel = data.channels.find(chan => chan.channelId === channelId);
  const uId = getUidFromToken(token);
  if (!isMemberOfChannel(findChannel, uId)) {
    throw HTTPError(FORBIDDEN, 'User is not a member of the channel');
  }

  // If the standup is active return its finish time otherwise return null
  let isActive = false;
  let timeFinish = null;

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
        if (channel.standUp.isActive === true) {
          isActive = true;
          timeFinish = channel.standUp.timeFinish;
        }
    }
  }
  return { isActive: isActive, timeFinish: timeFinish };
}

