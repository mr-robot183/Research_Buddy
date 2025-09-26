// backend/server.js
const express = require('express');
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function init() {
  await client.connect();
  db = client.db('ai_pdf_db');
  console.log('Connected to MongoDB');
}
init();

// List PDFs with id, name, completed status
app.get('/pdfs', async (req, res) => {
  const files = await db.collection('pdfs.files').find({}).toArray();
  const pdfs = files.map(f => ({
    id: f._id.toString(),
    name: f.filename,
    completed: f.completed || false
  }));
  res.json(pdfs);
});

// Serve raw PDF
app.get('/pdf/:id/raw', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    const downloadStream = bucket.openDownloadStream(id);

    downloadStream.on('error', () => {
      res.status(404).send('PDF not found');
    });

    res.setHeader('Content-Type', 'application/pdf');
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Toggle completed status
app.post('/pdf/:id/toggle', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const filesColl = db.collection('pdfs.files');

    const file = await filesColl.findOne({ _id: id });
    if (!file) return res.status(404).send('PDF not found');

    const completed = !file.completed;
    await filesColl.updateOne({ _id: id }, { $set: { completed } });

    res.json({ completed });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});