// import necessary libraries
const admin = require('firebase-admin');

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// get the user token and the deal id from the command line arguments
const userToken = process.argv[2];
const dealId = process.argv[3];

// send the notification
const sendNotification = async () => {
  // get the deal
  const dealSnap = await admin.firestore().collection('deals').doc(dealId).get();
  const deal = dealSnap.data();

  // construct the notification
  const notification = {
    notification: {
      title: `Deal Alert: ${deal.name}`,
      body: `Your favorite deal "${deal.name}" is starting in one hour!`,
    },
  };

  // send the notification
  await admin.messaging().sendToDevice(userToken, notification);
};

sendNotification();
