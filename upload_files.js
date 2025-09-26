require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function uploadPDF(filePath) {
    await client.connect();
    const db = client.db('ai_pdf_db');
    const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });

    const stream = fs.createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(path.basename(filePath));
    stream.pipe(uploadStream)
        .on('error', console.error)
        .on('finish', () => console.log(`${filePath} uploaded`));
}

async function uploadAllPDFsFromFolder(folderPath) {
    // Read all files in folder
    const files = fs.readdirSync(folderPath);

    // Filter only PDFs
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));

    // Upload each PDF
    for (const file of pdfFiles) {
        const fullPath = path.join(folderPath, file);
        await uploadPDF(fullPath);
    }

    console.log('All PDFs uploaded!');
}

// Use folder path "a/b/c"
uploadAllPDFsFromFolder('/Users/priyanshusuandia/Documents/Research_Papers/Circuit_Intuitions');