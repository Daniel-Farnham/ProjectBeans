import { getData, setData } from './dataStore';
import { userIdExists, tokenExists, User, error, getUidFromToken } from './other';
import validator from 'validator';
import HTTPError from 'http-errors';



export function standupStartV1 (channelId: number, length: number) {

    /*
        Standups can be started on the frontend by typing "/standup X"
        Standups can be started on the frontend by typing "/standup X"        

    */

}