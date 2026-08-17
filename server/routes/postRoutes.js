// ==============================================================================
// POST ROUTER
// ==============================================================================
// Routes map incoming HTTP URLs and methods (GET, POST, DELETE) to their
// corresponding controller functions and middleware handlers.

const express = require("express");
const router = express.Router();

// Import controller functions containing database logic
const {
  getPosts,
  createPost,
  deletePost,
} = require("../controllers/postController");

// Import Multer middleware for parsing multipart/form-data (image uploads)
const upload = require("../middleware/upload");

// ------------------------------------------------------------------------------
// Route: /api/posts
// ------------------------------------------------------------------------------

// GET /api/posts - Fetch all posts
router.get("/", getPosts);

// POST /api/posts - Create a new post with optional single image upload ('image' field)
// upload.single('image') intercepts the request before createPost runs.
// If an image file is attached with the key 'image', Multer puts it into req.file.
router.post("/", upload.single("image"), createPost);

// DELETE /api/posts/:id - Delete a post by its MongoDB ObjectId
router.delete("/:id", deletePost);

module.exports = router;
