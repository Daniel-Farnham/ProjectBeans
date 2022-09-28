// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  // TODO: insert your data structure that contains 
  // users + channels here
  users: [
    {
      uId: 10,
      password: 'password1',
      nameFirst: 'Ada',
      nameLast: 'Lovelace',
      email: 'ada.l@gmail.com',
      handleStr: 'adalovelace',
    },
  ],

  channels: [
    {
      channelId: 1,
      name: 'W17C_BOOST',
      ownerMembers: [user1, user2],
      allMembers: [user1, user2, user3],
      messages: messagesObject,
      isPublic: true,
    },
  ],
}


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
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
