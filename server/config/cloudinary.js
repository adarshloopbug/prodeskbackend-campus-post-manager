// ==============================================================================
// CLOUDINARY CONFIGURATION
// ==============================================================================
// Cloudinary is a cloud-based media management service.
// Instead of storing image files on our local server or inside MongoDB (which slows down queries
// and bloats the database), we upload images to Cloudinary. Cloudinary then hosts the image
// on a CDN and gives us a public HTTPS URL (e.g., https://res.cloudinary.com/...) to save in MongoDB.

const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// Load environment variables so process.env has the Cloudinary API keys
dotenv.config();

// Configure the Cloudinary SDK using secret credentials stored securely in .env.
// NEVER hardcode API keys directly in your source code because they would be exposed on GitHub!
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
