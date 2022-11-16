import { getData, setData } from './dataStore';
import { tokenExists, User, error, getUidFromToken, channelIdExists, isMemberOfChannel } from './other';
import HTTPError from 'http-errors';



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



