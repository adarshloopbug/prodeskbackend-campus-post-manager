// ==============================================================================
// CAMPUS POSTS MANAGER - MAIN APP COMPONENT
// ==============================================================================
// App.jsx acts as the central state manager and orchestrator for our React frontend.
// It manages:
// 1. Fetching posts from the Express REST API on initial load (useEffect)
// 2. Maintaining application state (posts, loading, errors) with useState
// 3. Submitting new posts (with Cloudinary image uploads) via FormData
// 4. Deleting posts and updating local state without full page refreshes

import React, { useState, useEffect } from "react";
import PostForm from "./components/PostForm";
import PostCard from "./components/PostCard";
import Loading from "./components/Loading";

// Base API URL pointing to our Express backend
// If VITE_API_URL is defined, use it. Otherwise, fallback to port 5000 on localhost and relative /api/posts in production (Vercel)
const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api/posts"
    : "/api/posts");

function App() {
  // ============================================================================
  // APPLICATION STATE (useState)
  // ============================================================================
  // posts: Array of post objects fetched from MongoDB
  const [posts, setPosts] = useState([]);

  // loading: Boolean indicating whether initial GET request is in progress
  const [loading, setLoading] = useState(true);

  // error: Error message string to display if network or server requests fail
  const [error, setError] = useState("");

  // isSubmitting: Tracks whether a new post is currently being uploaded/created
  const [isSubmitting, setIsSubmitting] = useState(false);

  // successMessage: Temporary feedback banner shown when an action succeeds
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================================
  // 1. FETCH POSTS FROM EXPRESS BACKEND (GET /api/posts)
  // ============================================================================
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.message || "Failed to load posts from server.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      // Beginner-friendly error message when backend is not running or unreachable
      setError(
        "Unable to connect to the server. Please make sure the backend is running on port 5000."
      );
    } finally {
      // Turn off loading spinner once request completes (whether success or fail)
      setLoading(false);
    }
  };

  // ============================================================================
  // 2. RUN EFFECT ON INITIAL COMPONENT MOUNT (useEffect)
  // ============================================================================
  // What is useEffect?
  // useEffect is a React Hook that lets you synchronize a component with an external system (like an API).
  // The empty dependency array [] tells React to run this effect EXACTLY ONCE when the component mounts.
  useEffect(() => {
    fetchPosts();
  }, []);

  // Helper to show a temporary success banner for 4 seconds
  const showFeedback = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  // ============================================================================
  // 3. CREATE NEW POST (POST /api/posts with multipart/form-data)
  // ============================================================================
  const handleAddPost = async (formData) => {
    try {
      setIsSubmitting(true);
      setError("");

      // IMPORTANT: When passing a FormData object as the body in fetch(),
      // do NOT set the 'Content-Type' header manually!
      // The browser must automatically set 'multipart/form-data' along with the boundary string.
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create post.");
      }

      // STATE UPDATE WITHOUT PAGE REFRESH:
      // Prepend the newly created post document returned by MongoDB to our existing posts array.
      // This causes React to immediately render the new post at the top of the feed.
      setPosts((prevPosts) => [result.data, ...prevPosts]);
      showFeedback("🎉 Post created and published successfully!");
      return true; // Indicates success so the form can clear
    } catch (err) {
      console.error("Create post error:", err);
      setError(err.message || "An error occurred while creating the post.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // 4. DELETE POST (DELETE /api/posts/:id)
  // ============================================================================
  const handleDeletePost = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete post.");
      }

      // STATE UPDATE WITHOUT PAGE REFRESH:
      // We filter out the deleted post by its unique MongoDB _id.
      // All posts where post._id !== id remain in state. React updates the DOM seamlessly.
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      showFeedback("🗑️ Post deleted successfully!");
    } catch (err) {
      console.error("Delete post error:", err);
      setError(err.message || "An error occurred while deleting the post.");
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header Section */}
      <header className="app-header">
        <div className="header-badge">MERN Fullstack System Integration</div>
        <h1 className="app-title">🎓 Campus Posts Manager</h1>
        <p className="app-subtitle">
          Connect React to Express & MongoDB with image uploads via Multer and Cloudinary.
        </p>
      </header>

      {/* 2. Global Feedback / Error Alerts */}
      <main className="main-content">
        {error && (
          <div className="alert-box alert-error" role="alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-body">
              <strong>Connection / Operation Error:</strong>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="alert-close"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success" role="alert">
            <div className="alert-icon">✅</div>
            <div className="alert-body">
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* 3. Post Creation Form */}
        <PostForm onAddPost={handleAddPost} isSubmitting={isSubmitting} />

        {/* 4. Posts Feed Section */}
        <section className="posts-section" aria-labelledby="posts-heading">
          <div className="posts-section-header">
            <h2 id="posts-heading" className="section-title">
              📋 Campus Announcements & Posts
            </h2>
            <span className="post-count-badge">
              {posts.length} {posts.length === 1 ? "Post" : "Posts"}
            </span>
          </div>

          {/* Conditional Rendering based on state */}
          {loading ? (
            <Loading message="Fetching posts from MongoDB database..." />
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No posts available yet</h3>
              <p>Be the first to share an announcement or event using the form above!</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="app-footer">
        <p>
          Campus Posts Manager • Built with MongoDB, Express, React, Node.js, Multer & Cloudinary
        </p>
      </footer>
    </div>
  );
}

export default App;
