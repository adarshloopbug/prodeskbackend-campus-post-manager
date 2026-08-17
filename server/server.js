// ==============================================================================
// CAMPUS POSTS MANAGER - EXPRESS SERVER ENTRY POINT
// ==============================================================================
// This file sets up the Express application, applies global middleware (CORS, JSON parser),
// establishes the MongoDB database connection via Mongoose, mounts API routes, and listens for requests.

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

// 1. Load environment variables from .env file into process.env
// Why .env?
// It keeps sensitive secrets (database passwords, API keys, ports) outside of source code.
// This prevents credentials from being exposed publicly when sharing or pushing code to GitHub.
dotenv.config();

// 2. Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/campus_posts";

// ==============================================================================
// MIDDLEWARE CONFIGURATION
// ==============================================================================

// What is CORS (Cross-Origin Resource Sharing)?
// By default, web browsers enforce the "Same-Origin Policy" for security.
// When our React frontend runs at http://localhost:5173 and attempts to make an HTTP request
// to our Express backend at http://localhost:5000, they are on different origins (different ports).
// The browser will block the response unless the backend explicitly provides CORS headers.
// The `cors()` middleware adds the required Access-Control-Allow-Origin headers to all responses.
app.use(cors());

// Parse incoming requests with JSON payloads (Content-Type: application/json)
// Puts parsed data into req.body
app.use(express.json());

// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// ==============================================================================
// MONGODB DATABASE CONNECTION
// ==============================================================================
// What is Mongoose?
// Mongoose is an Object Data Modeling (ODM) library that manages relationships between data,
// provides schema validation, and translates between objects in code and documents in MongoDB.
//
// What does mongoose.connect() do?
// It establishes an active TCP connection pool between this Node.js process and the MongoDB cluster.
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds if MongoDB is not reachable
  })
  .then(() => {
    console.log("=========================================");
    console.log(" MongoDB Connected Successfully!");
    console.log(` Database: ${mongoose.connection.name}`);
    console.log("=========================================");
  })
  .catch((err) => {
    console.error("=========================================");
    console.error(" MongoDB Connection Notice:");
    console.error(" Error details:", err.message);
    console.error(" Tip: For persistent storage, paste your MongoDB Atlas URI in server/.env");
    console.error(" The backend will use in-memory storage so you can still test CRUD operations!");
    console.error("=========================================");
  });

// ==============================================================================
// API ROUTES
// ==============================================================================

// Mount the posts router under the /api/posts prefix
const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

// Health check endpoint to verify backend status
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Campus Posts Backend Server is healthy and running!",
    timestamp: new Date().toISOString(),
  });
});

// Root welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Campus Posts API!",
    endpoints: {
      getAllPosts: "GET /api/posts",
      createPost: "POST /api/posts (multipart/form-data with title, description, optional image)",
      deletePost: "DELETE /api/posts/:id",
      healthCheck: "GET /api/health",
    },
  });
});

// ==============================================================================
// ERROR HANDLING MIDDLEWARE
// ==============================================================================

// Handle Multer errors (e.g., file size exceeds 5MB or invalid file type)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File is too large! Maximum image size allowed is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload Error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "An error occurred during request processing.",
    });
  }
  next();
});

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==============================================================================
// START SERVER
// ==============================================================================
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(` Backend server running at: http://localhost:${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/posts`);
  });
}

module.exports = app;

