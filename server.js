require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve index.html at root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store current image URL and public_id
let currentImage = null;

// Upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload started');
    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file);

    // If there's a previous image, delete it from Cloudinary
    if (currentImage && currentImage.public_id) {
      try {
        console.log('Deleting previous image:', currentImage.public_id);
        await cloudinary.uploader.destroy(currentImage.public_id);
      } catch (error) {
        console.error('Error deleting previous image:', error);
      }
    }

    // Convert buffer to base64
    console.log('Converting file to base64');
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    // Upload to Cloudinary
    console.log('Uploading to Cloudinary');
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto'
    });
    
    console.log('Cloudinary upload result:', result);

    // Update current image
    currentImage = {
      url: result.secure_url,
      public_id: result.public_id
    };

    console.log('Current image updated:', currentImage);

    res.json({ 
      message: 'Upload successful',
      imageUrl: result.secure_url 
    });
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Get current image endpoint
app.get('/images', (req, res) => {
  res.json(currentImage ? [currentImage] : []);
});

// Use Railway's PORT or fallback to 3000
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
