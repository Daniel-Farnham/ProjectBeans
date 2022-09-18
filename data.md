```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + channels here
  users: [
    {
      uId: 10,
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


```

[Optional] short description: 

- messagesObject:
``` javascript
messages: [
    {
      messageId: 1,
      uId: 1,
      message: 'Hello world',
      timeSent: 1582426789,
    }
  ],
  start: 0,
  end: 50,
  ```
