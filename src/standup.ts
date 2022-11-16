import { getData, setData } from './dataStore';
import { userIdExists, tokenExists, User, error, getUidFromToken, channelIdExists, isMemberOfChannel } from './other';
import validator from 'validator';
import HTTPError from 'http-errors';



export function standupStartV1 (token: string, channelId: number, length: number) {
    const data = getData();
    const findChannel = data.channels.find(chan => chan.channelId === channelId);

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

    const currentTime = Math.floor((new Date()).getTime() / 1000);
    const StopStandup = {
        isActive: false,
        timeFinish: timeFinish, 
    }

    for (const channel of data.channels) {
        if (channel.channelId === channelId) {
            if(currentTime > timeFinish) {
                channel.standUp.push(StopStandup);
            }
            if (currentTime < timeFinish) {
                channel.standUp.push(ActivateStandup);
            }
        }
    }
    setData(data);

    return {timeFinish: timeFinish};
   
}

function timeStandup (length) {
    let timeStart = Math.floor((new Date()).getTime() / 1000);
    let timeFinish = timeStart + length; 
  
    return timeFinish; 
  
}

