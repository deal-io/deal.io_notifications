// import necessary libraries
const admin = require('firebase-admin');

let serviceAccount = require('./serviceAccountKey.json');
// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (dealID, dealName) => {
    // construct the notification
    const message = {
        notification: {
            title: `Deal Alert: ${dealName}`,
            body: `"${dealName}" is starting in one hour!`,
          },
        topic: dealID
      };
  
    // send the notification
    await admin.messaging().send(message)
        .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
};
  
const dealID = process.argv[2];
const dealName = process.argv[3];
sendNotification(dealID, dealName);
  
