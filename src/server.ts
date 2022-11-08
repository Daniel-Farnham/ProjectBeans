import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import fs from 'fs';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { clearV1 } from './other';
import { authLoginV1, authRegisterV1, authLogoutV1 } from './auth';
import { getData, setData } from './dataStore';
import {
  channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1,
  channelAddOwnerV1, channelLeaveV1, channelRemoveOwnerV1
} from './channel';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels';
import { userProfileSetNameV1, userProfileSetEmailV1, userProfileSetHandleV1 } from './users';
import { messageSendV1, messageEditV1, messageRemoveV1 } from './message';
import { dmCreateV1, dmDetailsV1, messageSendDmV1, dmMessagesV1, dmListV1, dmLeaveV1, dmRemoveV1 } from './dm';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Importing implementation functions
import { userProfileV1, usersAllV1 } from './users';

// Get data. If datastore file exists, then update data to match datastore
let data = getData();
if (fs.existsSync('./dataStore.json')) {
  const dbStr = fs.readFileSync('./dataStore.json');
  data = JSON.parse(String(dbStr));
  setData(data);
}

// Function to fetch current datastore and store into datastore file
const save = () => {
  data = getData();
  const jsonStr = JSON.stringify(data);
  fs.writeFileSync('./dataStore.json', jsonStr);
};

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// Delete request for /clear/v1
app.delete('/clear/v1', (req: Request, res: Response, next) => {
  res.json(clearV1());
  save();
});

app.post('/auth/register/v2', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
  save();
});

app.post('/channels/create/v2', (req: Request, res: Response, next) => {
  const { name, isPublic } = req.body;
  const token = req.header('token');
  res.json(channelsCreateV1(token, name, isPublic));
  save();
});

app.get('/channels/list/v2', (req:Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListV1(token));
  save();
});

app.get('/channels/listAll/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(channelsListAllV1(token));
  save();
});

app.post('/channel/invite/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  res.json(channelInviteV1(token, channelId, uId));
  save();
});

app.post('/channel/leave/v1', (req:Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelLeaveV1(token, channelId));
  save();
});

app.post('/channel/addowner/v1', (req:Request, res:Response, next) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelAddOwnerV1(token, channelId, uId));
  save();
});

app.post('/channel/removeowner/v1', (req:Request, res: Response, next) => {
  const { channelId, uId } = req.body;
  const token = req.header('token');
  res.json(channelRemoveOwnerV1(token, channelId, uId));
  save();
});

app.get('/channel/messages/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  res.json(channelMessagesV1(token, channelId, start));
});

app.get('/user/profile/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(token, uId));
  save();
});

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(token, uId));
  save();
});

app.put('/user/profile/setname/v1', (req: Request, res: Response, next) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.header('token');
  res.json(userProfileSetNameV1(token, nameFirst, nameLast));
  save();
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response, next) => {
  const { email } = req.body;
  const token = req.header('token');
  res.json(userProfileSetEmailV1(token, email));
  save();
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response, next) => {
  const { handleStr } = req.body;
  const token = req.header('token');
  res.json(userProfileSetHandleV1(token, handleStr));
  save();
});

// users/all/v1
app.get('/users/all/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(usersAllV1(token));
  save();
});

app.post('/auth/login/v2', (req: Request, res: Response, next) => {
  const email = req.body.email as string;
  const password = req.body.password as string;
  res.json(authLoginV1(email, password));
  save();
});

app.post('/channel/join/v2', (req: Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = req.header('token');
  res.json(channelJoinV1(token, channelId));
  save();
});

app.get('/channel/details/v2', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
  save();
});

app.post('/auth/logout/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(authLogoutV1(token));
  save();
});

app.post('/message/send/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const channelId = parseInt(req.body.channelId as string);
  const message = req.body.message as string;
  res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.body.messageId as string);
  const message = req.body.message as string;
  res.json(messageEditV1(token, messageId, message));
  save();
});

app.post('/dm/leave/v1', (req: Request, res: Response, next) => {
  const { dmId } = req.body;
  const token = req.header('token');
  res.json(dmLeaveV1(token, dmId));
});

app.delete('/message/remove/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const messageId = parseInt(req.query.messageId as string);
  res.json(messageRemoveV1(token, messageId));
});

app.post('/message/senddm/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.body.dmId as string);
  const message = req.body.message as string;
  res.json(messageSendDmV1(token, dmId, message));
  save();
});

app.post('/dm/create/v1', (req: Request, res: Response, next) => {
  const { uIds } = req.body;
  const token = req.header('token');
  res.json(dmCreateV1(token, uIds));
  save();
});

app.delete('/dm/remove/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmRemoveV1(token, dmId));
});

app.get('/dm/details/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  res.json(dmDetailsV1(token, dmId));
  save();
});

app.get('/dm/messages/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  res.json(dmMessagesV1(token, dmId, start));
});

app.get('/dm/list/v1', (req: Request, res: Response, next) => {
  const token = req.header('token');
  res.json(dmListV1(token));
  save();
});

// handles errors nicely
app.use(errorHandler());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
