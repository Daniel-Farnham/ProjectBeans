import { getData, setData } from './dataStore';
import { tokenExists, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

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