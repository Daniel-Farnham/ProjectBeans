import { userIdExists, channelIdExists, tokenExists } from './other';
import { getData, setData } from './dataStore';
import { isMemberOfChannel, error } from './other';
import { getUidFromToken } from './users';


const MIN_MESSAGE_LEN = 1; 
const MAX_MESSAGE_LEN = 1000; 

type messageId = { messageId: number }


function messageSendV1 (token: string, channelId: number, message: string): messageId | error {
    const data = getData(); 
    const findChannel = data.channels.find(chan => chan.channelId === channelId)

    // Check token exists 
    if (!(tokenExists(token))) {
        return { error: 'token is invalid.' };
    }

    console.log('ChannelId: ' + channelId )
    if (!channelIdExists(channelId)) {
        return { error: 'channelId is invalid' };
    }
    
// Check if length of the message is between 1-1000 characters long. 
// Create message if true, return error if false. 
    const messageStr = (name); 
    if (messageStr.length < MIN_MESSAGE_LEN || messageStr.length > MAX_MESSAGE_LEN) {
        return { error: 'Message is invalid' }; 
    }

    const messageId = 1; // Dummy variable to be deleted 
    return messageId; 
}

export { messageSendV1 }; 