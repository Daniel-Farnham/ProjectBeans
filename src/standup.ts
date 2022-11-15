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

    const length_ms = length*1000; 
    if (!channelIdExists(channelId)) {
        throw HTTPError(400, 'channelId is invalid');
    }

    if(length_ms < 0) {
        throw HTTPError(400, 'standup length is invalid');
    }

    const uId = getUidFromToken(token);
    if (!isMemberOfChannel(findChannel, uId)) {
        throw HTTPError(403, 'User is not a member of the channel');
    }

    // if channelmessages = 
    const time = timeStandup(length_ms); 
    
    return {timeFinish: time};
    /*
        Standups can be started on the frontend by typing "/standup X"
        Standups can be started on the frontend by typing "/standup X"        

    */
}

function timeStandup (length_ms) {
    
    let timeStart = Math.floor((new Date()).getTime()); 
    
    while (timeStart < length_ms) {
        isActive(true); 
        timeStart++; 
    }
    
    isActive(false);

    const timeFinish = timeStart/1000; 
    return timeFinish; 
  
}

function isActive () {

}