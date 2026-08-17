// ==============================================================================
// POSTCARD COMPONENT
// ==============================================================================
// Responsible for rendering an individual campus post card.
// Displays title, description, creation date, Cloudinary image (if available),
// and provides an interactive Delete button.

import React, { useState } from "react";

function PostCard({ post, onDelete }) {
  // Local state to track whether this specific post is in the process of being deleted
  const [isDeleting, setIsDeleting] = useState(false);

  // Format the MongoDB ISO date into a human-readable string
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  // Handle delete button click
  const handleDeleteClick = async () => {
    // Confirm with the user before deleting to prevent accidental clicks
    const confirmed = window.confirm(`Are you sure you want to delete "${post.title}"?`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      // Call the parent onDelete function which sends DELETE /api/posts/:id to Express
      await onDelete(post._id);
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="post-card" id={`post-${post._id}`}>
      {/* 1. Image Section: Render image if Cloudinary URL exists */}
      {post.imageUrl ? (
        <div className="post-image-container">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="post-image"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="no-image-badge">
          <span>📷 No image attached</span>
        </div>
      )}

      {/* 2. Content Section */}
      <div className="post-content">
        <div className="post-header">
          <h3 className="post-title">{post.title}</h3>
          <span className="post-date">{formattedDate}</span>
        </div>

        <p className="post-description">{post.description}</p>

        {/* 3. Action Section */}
        <div className="post-actions">
          <button
            type="button"
            className="btn-delete"
            id={`delete-btn-${post._id}`}
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="btn-spinner"></span> Deleting...
              </>
            ) : (
              "🗑️ Delete"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
