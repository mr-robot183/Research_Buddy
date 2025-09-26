// backend/init_pdfs.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function init() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('ai_pdf_db');
  const filesColl = db.collection('pdfs.files');

  await filesColl.updateMany({}, {
    $set: {
      completed: false,
      basket: 'Default',
      notes: ''
    }
  });

  console.log('All PDFs initialized with default fields.');
  await client.close();
}

init();