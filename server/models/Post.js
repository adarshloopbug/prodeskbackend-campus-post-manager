// ==============================================================================
// POST MONGOOSE MODEL
// ==============================================================================
// Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
// It provides a schema-based solution to model application data, enforce validation,
// and perform database queries using clean JavaScript methods.

const mongoose = require("mongoose");

// A Schema defines the shape and structure of documents inside a MongoDB collection.
// It acts as a blueprint specifying field names, data types, and validation rules.
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  // We store ONLY the Cloudinary secure image URL string here.
  // We DO NOT store binary files or Base64 strings in MongoDB because:
  // 1. Storing large binary/Base64 data in MongoDB exceeds the 16MB BSON document limit.
  // 2. It severely slows down database queries and index performance.
  // 3. Cloud CDNs (like Cloudinary) deliver optimized, fast-loading images worldwide.
  imageUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A Model is a compiled version of the schema.
// An instance of a model represents a MongoDB document and handles creating/reading/updating/deleting.
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
