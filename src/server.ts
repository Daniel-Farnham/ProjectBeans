import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import fs from 'fs';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { clearV1 } from './other';
import { authLoginV1, authRegisterV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { getData, setData } from './dataStore';
import { channelsCreateV1 } from './channels';
import { userProfileSetNameV1, userProfileSetEmailV1, userProfileSetHandleV1 } from './users';

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
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV1(token, name, isPublic));
  save();
});

// Get userProfileV2
app.get('/user/profile/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const uId = parseInt(req.query.uId as string);
  res.json(userProfileV1(token, uId));
  save();
});

app.put('/user/profile/setname/v1', (req: Request, res: Response, next) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userProfileSetNameV1(token, nameFirst, nameLast));
  save();
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response, next) => {
  const { token, email } = req.body;
  res.json(userProfileSetEmailV1(token, email));
  save();
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response, next) => {
  const { token, handleStr } = req.body;
  res.json(userProfileSetHandleV1(token, handleStr));
  save();
});

// users/all/v1
app.get('/users/all/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  res.json(usersAllV1(token));
  save();
});

app.post('/auth/login/v2', (req: Request, res: Response, next) => {
  const email = req.body.email as string;
  const password = req.body.password as string;
  res.json(authLoginV1(email, password));
  save();
});

// Get channel/details/v2
app.get('/channel/details/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const channelId = parseInt(req.query.channelId as string);
  res.json(channelDetailsV1(token, channelId));
  save();
});

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
