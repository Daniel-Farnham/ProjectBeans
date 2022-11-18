import { datastore } from './types';

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: datastore = {
  users: [],
  channels: [],
  sessions: [],
  messageCount: 0,
  tokenCount: 0,
  dms: [],
  notifications: [],
  resetCodeRequests: [],
  resetCode: 0,
  workspaceStats: {
    channelsExist: [],
    dmsExist: [],
    messagesExist: []
  },
  timeoutIds: []
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): datastore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: datastore) {
  data = newData;
}

export { getData, setData };
