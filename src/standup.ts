import { getData, setData } from './dataStore';
import { tokenExists, User, error, getUidFromToken, channelIdExists, isMemberOfChannel, FORBIDDEN, BAD_REQUEST } from './other';
import HTTPError from 'http-errors';

type standupInfo = {
    isActive: boolean
    timeFinish: number | null
}


export function standupStartV1 (token: string, channelId: number, length: number) {
    const data = getData();
    const findChannel = data.channels.find(chan => chan.channelId === channelId);

    console.log('test');
    if (!(tokenExists(token))) {
        throw HTTPError(403, 'token is invalid');
    }

    if (!channelIdExists(channelId)) {
        throw HTTPError(400, 'channelId is invalid');
    }

    if(length < 0) {
        throw HTTPError(400, 'standup length is invalid');
    }

    const uId = getUidFromToken(token);
    if (!isMemberOfChannel(findChannel, uId)) {
        throw HTTPError(403, 'User is not a member of the channel');
    }

    for (const channel of data.channels) {
        if (channel.channelId === channelId) {
            for (const standup of channel.standUp) {
                if (standup.isActive === true) {
                    throw HTTPError(400, 'Active standup already running in the channel'); 
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

    const start = new Date().getTime();
    while (new Date().getTime() < timeFinish) {
    }

    for (const channel of data.channels) {
        for (const targetStandup of channel.standUp) {
            if (targetStandup.timeFinish === timeFinish) {
                targetStandup.isActive = false; 
           
            }
        }
    }
    setData(data);
    
    // to pass relevant test cases need to make sure we might need to implement setTimeout (asynchronous) 
    // if currentTime > timeFinish change targetStandup.isActive = false; 
    // Probably need to sort out timeFinish like the milli seconds and what not. 

    return { timeFinish: timeFinish };
   
}

function timeStandup (length) {
    let timeStart = Math.floor((new Date()).getTime());
    let timeFinish = timeStart + length; 
  
    return timeFinish;  
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
export function standupActiveV1(token: string, channelId: number): standupInfo {
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
  if (findChannel.standUp.isActive) {
    isActive = true;
    timeFinish = findChannel.standUp.timeFinish;
  }

  return { isActive: isActive, timeFinish: timeFinish };
}

