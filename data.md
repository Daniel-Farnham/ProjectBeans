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
      isGlobalOwner: true,
    },
    {
      uId: 20,
      nameFirst: 'Jane',
      nameLast: 'Doe',
      email: 'jane.doe@gmail.com',
      handleStr: 'janedoe',
      isGlobalOwner: false,
    },
  ],

  channels: [
    {
      channelId: 1,
      name: 'W17C_BOOST',
      ownerMembers: [
        {
          uId: 10,
          nameFirst: 'Ada',
          nameLast: 'Lovelace',
          email: 'ada.l@gmail.com',
          handleStr: 'adalovelace',
          isGlobalOwner: true,
        }
      ],
      allMembers: [
        {
          uId: 10,
          nameFirst: 'Ada',
          nameLast: 'Lovelace',
          email: 'ada.l@gmail.com',
          handleStr: 'adalovelace',
          isGlobalOwner: true,
        }
      ],
      messages: [
        {
          messageId: 0,
          uId: 10,
          message: "Hello",
          timeSent: 1665037588,
        },
        {
          messageId: 1,
          uId: 20,
          message: "Hello",
          timeSent: 1665037580,
        },
       
      ],
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
