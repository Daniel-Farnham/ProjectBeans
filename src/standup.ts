import { getData, setData } from './dataStore';
import { userIdExists, tokenExists, User, error, getUidFromToken, channelIdExists, isMemberOfChannel } from './other';
import validator from 'validator';
import HTTPError from 'http-errors';



export function standupStartV1 (token: string, channelId: number, length: number) {
    const data = getData();
    const findChannel = data.channels.find(chan => chan.channelId === channelId);

    
    // might need to convert length to time, length is in seconds. 
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
        if(channel.channelId === channelId && channel.isActive === true) {
            throw HTTPError(400, 'Active standup already running in the channel'); 
        }
    }

    const timeFinish = timeStandup(length); 
    
    /*
    let isActive = true; 

    const ActivateStandup = {
        isActive: isActive,
    };
    */ 
    
    for (const channel of data.channels) {
        if (channel.channelId === channelId) {
          channel.isActive = true;
        }
    }
    setData(data);
    


    console.log(data.channels); 
    return {timeFinish: timeFinish};
    
    /*
    TO DO LIST 
        - don't need to call this function 
        - but I will need a way of saying that this channel has an active standup. 
        - then once I have that, just check if (standup is active) { throw error }
        - 

    */
   
}

function timeStandup (length) {
    let timeStart = Math.floor((new Date()).getTime() / 1000);
    let timeFinish = timeStart + length; 
  
    return timeFinish; 
  
}



function isStandUpActive (channelId) {
    
}