// import necessary libraries
const admin = require('firebase-admin');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// get the customers and deals
const getCustomersAndDeals = async () => {
  const customersSnap = await db.collection('customers').get();
  const dealsSnap = await db.collection('deals').get();

  const customers = customersSnap.docs.map(doc => doc.data());
  const deals = dealsSnap.docs.map(doc => doc.data());

  return { customers, deals };
};

// schedule notifications
const scheduleNotifications = async () => {
  const { customers, deals } = await getCustomersAndDeals();

  // loop over each customer
  for (let customer of customers) {
    // loop over each favorite of the customer
    for (let favorite of customer.favorites) {
      // find the corresponding deal
      const deal = deals.find(deal => deal.id === favorite);
      if (!deal) continue;

      // calculate the time one hour before the deal goes active
      const dealTime = new Date(deal.startTime);
      dealTime.setHours(dealTime.getHours() - 1);
      const scheduleTime = `${dealTime.getHours()}:${dealTime.getMinutes()}`;

      // schedule the execution of the send_notification script
      await exec(`echo "/path/to/send_notification.js ${customer.token} ${deal.id}" | at ${scheduleTime}`);
    }
  }
};

scheduleNotifications();
