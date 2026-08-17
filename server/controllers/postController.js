// ==============================================================================
// POST CONTROLLER
// ==============================================================================
// Controllers contain the core business logic for processing HTTP requests.
// They interact with Mongoose models, external services (Cloudinary), and return
// standard JSON responses with appropriate HTTP status codes.

const mongoose = require("mongoose");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");

// In-memory fallback cache used ONLY if MongoDB connection is not active yet.
// This prevents Mongoose buffering timeouts and allows testing UI/CRUD immediately!
let fallbackPosts = [
  {
    _id: "664b3c8f9a21d1e4e892c101",
    title: "Welcome to Campus Posts Manager! 🎓",
    description: "Connect React to Express, MongoDB, Multer, and Cloudinary. Add your own MongoDB Atlas URI in server/.env to persist data permanently.",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

/**
 * Check if Cloudinary credentials in .env are configured with real keys
 */
const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return (
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== "your_cloud_name" &&
    apiKey !== "your_api_key" &&
    apiSecret !== "your_api_secret"
  );
};

/**
 * Helper function to stream a file buffer directly to Cloudinary.
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "campus_posts",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// ==============================================================================
// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
// ==============================================================================
const getPosts = async (req, res) => {
  try {
    // Check if MongoDB is currently connected (1 = connected)
    if (mongoose.connection.readyState === 1) {
      const posts = await Post.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: posts.length,
        data: posts,
      });
    }

    // Fallback: If MongoDB is not connected, serve in-memory posts so UI doesn't hang
    console.warn("⚠️ MongoDB not connected yet. Serving in-memory fallback posts.");
    return res.status(200).json({
      success: true,
      count: fallbackPosts.length,
      data: fallbackPosts,
      notice: "Serving in-memory fallback. Add your MONGO_URI in server/.env for database persistence.",
    });
  } catch (error) {
    console.error("Error in getPosts:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: Unable to fetch posts.",
      error: error.message,
    });
  }
};

// ==============================================================================
// @desc    Create a new post (with optional image upload)
// @route   POST /api/posts
// @access  Public
// ==============================================================================
const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Basic validation: title and description are required
    if (!title || !title.trim() || !description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide both a title and a description.",
      });
    }

    let imageUrl = "";

    // 2. Handle image upload if a file was selected by the user
    if (req.file) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({
          success: false,
          message:
            "Cloudinary credentials not configured in Vercel. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel Dashboard (Settings → Environment Variables).",
        });
      }

      try {
        // Ensure Cloudinary SDK is initialized with latest .env credentials
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        // Upload the user's exact file buffer directly to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        const errMsg = uploadError?.message || uploadError?.error?.message || "Upload stream failed";
        return res.status(500).json({
          success: false,
          message: `Cloudinary upload failed: ${errMsg}. Please verify your Cloudinary keys in Vercel Environment Variables.`,
          error: errMsg,
        });
      }
    }

    // 3. Save post to MongoDB if connected, or fallback to in-memory store
    if (mongoose.connection.readyState === 1) {
      const newPost = await Post.create({
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Post created successfully in MongoDB!",
        data: newPost,
      });
    }

    // In-memory fallback if MongoDB connection is pending
    const newPost = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl,
      createdAt: new Date().toISOString(),
    };
    fallbackPosts.unshift(newPost);

    return res.status(201).json({
      success: true,
      message: "Post created successfully! (In-memory fallback)",
      data: newPost,
    });
  } catch (error) {
    console.error("Error in createPost:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: Unable to create post.",
      error: error.message,
    });
  }
};

// ==============================================================================
// @desc    Delete a post by ID
// @route   DELETE /api/posts/:id
// @access  Public
// ==============================================================================
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id) && !id.startsWith("664b3c8f")) {
      return res.status(400).json({
        success: false,
        message: "Invalid Post ID format.",
      });
    }

    // 2. Delete from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const deletedPost = await Post.findByIdAndDelete(id);

      if (!deletedPost) {
        return res.status(404).json({
          success: false,
          message: `Post with ID ${id} not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Post deleted successfully from MongoDB.",
        data: { id: id },
      });
    }

    // In-memory fallback deletion
    const initialLength = fallbackPosts.length;
    fallbackPosts = fallbackPosts.filter((post) => post._id !== id);

    if (fallbackPosts.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `Post with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
      data: { id: id },
    });
  } catch (error) {
    console.error("Error in deletePost:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error: Unable to delete post.",
      error: error.message,
    });
  }
};

module.exports = {
  getPosts,
  createPost,
  deletePost,
};

