// import necessary libraries
const admin = require('firebase-admin');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

let serviceAccount = require('./serviceAccountKey.json');

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// get the customers and deals
const getDeals = async () => {
  const dealsSnap = await db.collection('deals').get();

  const deals = dealsSnap.docs.map(doc => {
    const data = doc.data();
    data.id = doc.id;  // Adding ID to the data
    return data;
});

  return deals;
};

function convertTo24HourMinus1Hour(timeStr) {
    const time = new Date(`01/01/2020 ${timeStr}`);
    let hours = time.getHours();
    let minutes = time.getMinutes();
  
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    return (hours - 1) + ':' + minutes;
}

// schedule notifications
const scheduleNotifications = async () => {
  const deals = await getDeals();

  // loop over each customer
  for (let deal of deals) {
    if (!deal.dealAttributes.daysActive[0]) continue;

    let dealName = deal.dealAttributes.dealName.replace(/'/g, "\\'"); // escape single quotes

    // schedule the execution of the send_notification script
    await exec(`echo "./send_notification.js ${deal.id} '${dealName}'" | at ${convertTo24HourMinus1Hour(deal.dealAttributes.startTime)}`);
}
};

scheduleNotifications();
