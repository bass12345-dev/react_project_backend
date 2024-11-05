const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const serviceAccount = require('./serviceAccount'); // Ensure this file is configured correctly

const app = express();
app.use(cors());

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Authenticate with Google using the service account
const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

// Root route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// Endpoint to upload file to Google Drive
app.post('/upload', upload.single('file'), async (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const folderId = '1lGTiCxnvlEx9Vbf3JoNlHE6s_zZ7o09-'; // Replace with your Google Drive folder ID

    try {
        // Prepare file metadata and media
        const fileMetadata = {
            name: req.file.originalname,
            parents: [folderId], 
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path),
        };

        // Upload file to Google Drive
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });

        // Cleanup: Delete the file from server storage after upload
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Failed to delete file:", err);
                // Optionally, you can log the error or send a response back
            }
        });

        // Send success response with file ID
        res.status(200).json({ fileId: response.data.id });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000; // Use the environment variable for port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Export the app for testing or other purposes
module.exports = app;
