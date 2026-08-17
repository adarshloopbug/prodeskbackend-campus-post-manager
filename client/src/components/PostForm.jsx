// ==============================================================================
// POSTFORM COMPONENT
// ==============================================================================
// Form component for creating a new campus post.
// Demonstrates:
// 1. Controlled React form inputs (useState)
// 2. File input handling and local image preview
// 3. Packaging text fields and file into a FormData object for multipart/form-data POST

import React, { useState, useRef } from "react";

function PostForm({ onAddPost, isSubmitting }) {
  // Controlled component state for form text inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // State for the selected image file and its temporary local preview URL
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Local form validation error state
  const [formError, setFormError] = useState("");

  // Ref to directly reset the HTML file input element when clearing the form
  const fileInputRef = useRef(null);

  // Handle file selection from the <input type="file">
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate that the selected file is an image
      if (!file.type.startsWith("image/")) {
        setFormError("Please select a valid image file (PNG, JPG, JPEG, WEBP, GIF).");
        return;
      }

      // Check max file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Image file size must be less than 5MB.");
        return;
      }

      setFormError("");
      setImageFile(file);
      // Create a temporary object URL for instant client-side preview before upload
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove the selected image before submission
  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent standard browser full-page reload

    // Basic frontend validation
    if (!title.trim() || !description.trim()) {
      setFormError("Please enter both a title and a description.");
      return;
    }

    setFormError("");

    // ============================================================================
    // WHAT IS FORMDATA?
    // ============================================================================
    // Normal JSON (application/json) cannot directly contain binary file streams.
    // The browser's built-in FormData API allows us to compile a set of key/value
    // pairs representing form fields and binary files to send as multipart/form-data.
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    if (imageFile) {
      // Append the actual file object. 'image' matches upload.single('image') in backend
      formData.append("image", imageFile);
    }

    try {
      // Call parent submission function in App.jsx
      const success = await onAddPost(formData);

      if (success) {
        // Clear all form inputs after successful post creation
        setTitle("");
        setDescription("");
        handleRemoveImage();
      }
    } catch (err) {
      console.error("Submission failed in PostForm:", err);
    }
  };

  return (
    <section className="form-card" aria-labelledby="form-heading">
      <h2 id="form-heading" className="form-title">
        ➕ Create New Campus Post
      </h2>

      {/* Display local validation error message if any */}
      {formError && (
        <div className="alert-box alert-error" role="alert">
          <span>⚠️ {formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form" id="create-post-form">
        {/* 1. Title Input */}
        <div className="form-group">
          <label htmlFor="post-title">
            Post Title <span className="required-star">*</span>
          </label>
          <input
            type="text"
            id="post-title"
            placeholder="e.g., Annual Tech Symposium 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
            className="form-input"
          />
        </div>

        {/* 2. Description Textarea */}
        <div className="form-group">
          <label htmlFor="post-description">
            Description <span className="required-star">*</span>
          </label>
          <textarea
            id="post-description"
            rows="4"
            placeholder="Provide all details about the announcement or event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            required
            className="form-textarea"
          ></textarea>
        </div>

        {/* 3. Image File Upload (Optional) */}
        <div className="form-group">
          <label htmlFor="post-image">
            Attach Image <span className="optional-tag">(Optional)</span>
          </label>

          <div className="file-upload-wrapper">
            <input
              type="file"
              id="post-image"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="file-input"
            />
          </div>

          {/* Local image preview before uploading to Cloudinary */}
          {imagePreview && (
            <div className="image-preview-box">
              <p className="preview-label">Image Preview:</p>
              <div className="preview-thumbnail-container">
                <img
                  src={imagePreview}
                  alt="Selected file preview"
                  className="preview-image"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn-remove-preview"
                  title="Remove selected image"
                  disabled={isSubmitting}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          id="submit-post-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="btn-spinner"></span> Creating Post...
            </>
          ) : (
            "🚀 Publish Post"
          )}
        </button>
      </form>
    </section>
  );
}

export default PostForm;
