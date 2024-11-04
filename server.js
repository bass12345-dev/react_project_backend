// index.js
const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

// Load your service account key file
const serviceAccount = require('./sanguine-fx-433905-t5-03c1334aa369.json');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' }); // Temp storage for files

// Authenticate with Google using the service account
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });


app.get('/', (req, res) => {
    res.send('Hello, World!');
  });


  // Endpoint to upload file to Google Drive
app.post('/upload', upload.single('file'), async (req, res) => {

    // Replace with your file path, folder ID, and MIME type
    const filePath = './0ibzpmgx.xyf.jpg';
    const folderId = '1lGTiCxnvlEx9Vbf3JoNlHE6s_zZ7o09-'; // Replace with the folder ID from Google Drive
    const mimeType = 'image/jpeg'; // Replace with your file's MIME type


  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId], // Specify the folder ID here
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Delete the file from server storage after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({ fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
