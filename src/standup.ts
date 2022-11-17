import { getData, setData } from './dataStore';
import { tokenExists, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

const  MAX_MESSAGE_LEN = 1000; 

type standupInfo = {
    isActive: boolean
    timeFinish: number | null
}

type timeFinish = {
    timeFinish: number | null
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

  const standupMessagesPackage = [];
  let index = 0; 

    // this is the bit where i will be using messages.

  while(standUpActive(token, channelId).isActive === true ) {
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
    packageAndSendStandUp(token, channelId, standupMessagesPackage);


  }
  standupMessagesPackageString = standupMessagesPackage[index].join('\n');
  
  messageSendV1(token, channelId, standupMessagesPackageString); 

  return {}; 
  

   packageAndSendStandUp(token, channelId, standupMessagesPackage) {

   }
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