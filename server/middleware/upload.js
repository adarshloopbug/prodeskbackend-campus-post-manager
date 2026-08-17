// ==============================================================================
// MULTER FILE UPLOAD MIDDLEWARE
// ==============================================================================
// What is multipart/form-data?
// Standard HTTP requests sending JSON (application/json) can only transmit text.
// When an HTML form contains binary files (like images, PDFs), the browser packages
// the request as 'multipart/form-data', dividing the payload into distinct parts with boundary markers.
//
// What does Multer do?
// Express cannot parse multipart/form-data on its own. Multer is a middleware that intercepts
// multipart requests, extracts the text fields into req.body, and extracts the file into req.file.

const multer = require("multer");
const path = require("path");

// We use memoryStorage() so the uploaded file is kept in memory as a Buffer (req.file.buffer).
// This allows us to stream the buffer directly to Cloudinary without writing temporary files to the local disk.
const storage = multer.memoryStorage();

// File filter to ensure only image files are accepted
const fileFilter = (req, file, cb) => {
  // Allowed image MIME types
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file with a helpful error message
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed!"
      ),
      false
    );
  }
};

// Configure Multer with storage, file filter, and a 5MB size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
