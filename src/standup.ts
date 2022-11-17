import { getData, setData } from './dataStore';
import { tokenExists, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

const  MAX_MESSAGE_LEN = 1000; 
type timeFinish = {
  timeFinish: number | null,
}

type isActive = {
  isActive: boolean,

}

/**
  * Starts a given standup from a given channel. The standup time is specified by its length
  * and the standup is set to active. The standup deactivates at the end of length time.
  *
  * @param {string} token - token of authorised user
  * @param {number} channelId - id of channel to send message to
  * @param {number} length
  * ...
  *
  * @returns {timeFinish} returns an object containing information
  * regarding the standups finish time
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

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standup of channel.standUp) {
        if (standup.isActive === true) {
          throw HTTPError(BAD_REQUEST, 'Active standup already running in the channel');
        }
      }
    }
  }


  // creating standup message package



    // this is the bit where i will be using messages.

  while(standUpActive(token, channelId).isActive === true ) {
    const packagedStandup = packageStandUp(token, channelId, standupMessagesPackage);
    // need to write if statement confirming tags. 
    standupMessagesPackage[index] = message; 
    index++; 
  }
  //while(standUpActive(token, channelId).isActive === true ) {
    //for (const channel of data.channels) {
      //if (channel.channelId === channelId) {
        //standupMessagesPackage[index] = channel.messages[index]; 
      //}
    //}
  //}

  // Checking if standUp has ended. 
  if (standUpActive(token, channelId).isActive === false) {
    
    messageSendV1(token, channelId, packagedStandup); 

  }
  
  
  

  return {}; 
  
   /*
  // all messages are packed together in one single message
  // posted by the user who started the standup 
  // the packaged messaged is sent to the channel where the standup started, timestamped at the moment the standup finished. 

  while (standup is active) {
    - Each message should be saved in an array which will be stored the in the standUp object. 
    - 

  }

  - to get user. In standup/start will need to record in the standup object a standupStart: uId. 
  - then can use that object to determine who to post the standup in the channel, will also be used to determine timestamp. 
  - Call messageSend with the joined array. 


  */

}

function packageStandUp(token, channelId, standupMessagesPackage) {
  const standupMessagesPackage = [];
  let index = 0; 

  // if index = 0. the first token = sta

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      standupMessagesPackage[index] = token + ':' + messages; 
    }
    index++; 
 }
 return standupMessagesPackageString = standupMessagesPackage[index].join('\n');
}

function timeStandup (length: number): number {
  const timeStart = Math.floor((new Date()).getTime());
  const timeFinish = timeStart + length;

  return timeFinish;
}





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

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const standup of channel.standUp) {
        if (standup.isActive === true) {
          throw HTTPError(BAD_REQUEST, 'Active standup already running in the channel');
        }
      }
    }
  }

  const timeFinish = timeStandup(length);
  const ActivateStandup = {
    isActive: true,
    timeFinish: timeFinish,
  };

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standUp.push(ActivateStandup);
    }
  }
  setData(data);

  setTimeout(function() {
    deactivateStandup(channelId, timeFinish);
  }, (length * 1000));

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
  const timeStart = Math.floor((new Date()).getTime());
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
    for (const targetStandup of channel.standUp) {
      if (targetStandup.timeFinish === timeFinish) {
        targetStandup.isActive = false;
      }
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
      for (const targetStandup of channel.standUp) {
        if (targetStandup.isActive === true) {
          isActive = true;
          timeFinish = targetStandup.timeFinish;
        }
      }
    }
  }

  return { isActive: isActive, timeFinish: timeFinish };
}

