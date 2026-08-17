# 📋 Project Prompt & Specification: Campus Posts Manager

A comprehensive specification and development guide for building a **Beginner-Friendly MERN Fullstack System Integration** project with image upload capabilities.

---

## 🎯 Project Overview & Objective

The objective of this project is to integrate a **React (Vite)** frontend with a **Node.js / Express / MongoDB** backend, demonstrating a complete CRUD REST API workflow with image uploads via **Multer** and **Cloudinary**.

### Tech Stack
* **Frontend**: React.js (v18), Vite, Vanilla CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose ODM
* **File Uploads**: Multer (Memory Storage)
* **Media Cloud Storage**: Cloudinary (v2 SDK)
* **Communication**: REST API with CORS headers

---

## 📐 Core Architecture

```text
campus-posts/
│
├── client/                      # Frontend Application (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Loading.jsx      # Async loading spinner
│   │   │   ├── PostCard.jsx     # Post item display card with delete action
│   │   │   └── PostForm.jsx     # Form with controlled inputs & image preview
│   │   ├── App.jsx              # Central state, useEffect & fetch handlers
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Custom responsive styles
│   ├── .env                     # Frontend environment variables (VITE_API_URL)
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary SDK credentials configuration
│   ├── controllers/
│   │   └── postController.js    # GET, POST (with buffer stream), DELETE handlers
│   ├── middleware/
│   │   └── upload.js            # Multer memory storage & image MIME filter
│   ├── models/
│   │   └── Post.js              # Mongoose schema for posts
│   ├── routes/
│   │   └── postRoutes.js        # Express routes mapped to controller actions
│   ├── server.js                # Express app, CORS, DB connection & error handlers
│   ├── .env                     # Backend secrets (PORT, MONGO_URI, Cloudinary keys)
│   ├── .env.example
│   └── package.json
│
├── .gitignore                   # Ignore node_modules, logs, and .env files
├── package.json                 # Root script runner (dev:client, dev:server)
├── prompt.md                    # Project requirements and prompt specification
└── README.md                    # Complete manual and viva preparation guide
```

---

## 🚫 Rules & Constraints (For Beginners)

### Do NOT:
* Over-engineer or introduce complex design patterns.
* Use Redux or complicated external state-management libraries.
* Use TypeScript (keep to clean modern JavaScript).
* Store images as Base64 strings or binary blobs in MongoDB.
* Hardcode credentials, API keys, or database URIs.
* Manually set `Content-Type: multipart/form-data` in frontend `fetch()` when using `FormData`.
* Force full browser reloads after creating or deleting posts.

### DO:
* Use simple, readable JavaScript with `async/await` and `try/catch`.
* Use React functional components with `useState` and `useEffect`.
* Use `fetch()` for all HTTP network requests.
* Use `cors` middleware on Express to permit cross-origin requests.
* Use `multer.memoryStorage()` to buffer incoming files in RAM.
* Upload image buffers directly to Cloudinary and store **only the HTTPS URL string** in MongoDB.
* Provide instant, optimistic UI updates on post creation and deletion.
* Include user-friendly loading indicators and error banners.

---

## 🔄 End-to-End Data Flow

### 1. Data Retrieval (`GET /api/posts`)
```text
React App Mounts ──> useEffect() ──> fetch('http://localhost:5000/api/posts')
       │
       ▼
Express postRoutes ──> postController.getPosts()
       │
       ▼
Mongoose: Post.find().sort({ createdAt: -1 })
       │
       ▼
MongoDB returns documents ──> Express sends JSON { success: true, data: [...] }
       │
       ▼
React setPosts(data) ──> UI renders PostCard list
```

### 2. Post Creation with Image (`POST /api/posts`)
```text
User fills Form ──> React PostForm builds new FormData() (title, description, image)
       │
       ▼
POST multipart/form-data ──> Express server :5000
       │
       ▼
Multer (upload.single('image')) ──> Text in req.body, Image in req.file.buffer
       │
       ▼
postController.createPost() ──> Streams buffer to Cloudinary API
       │
       ▼
Cloudinary returns secure CDN URL (https://res.cloudinary.com/...)
       │
       ▼
Mongoose saves document in MongoDB:
{
  title: String,
  description: String,
  imageUrl: String (Cloudinary URL only),
  createdAt: Date
}
       │
       ▼
Express responds with 201 Created ──> React updates state: setPosts([newPost, ...posts])
```

### 3. Post Deletion (`DELETE /api/posts/:id`)
```text
User clicks Delete ──> DELETE /api/posts/:id
       │
       ▼
Mongoose: Post.findByIdAndDelete(id)
       │
       ▼
Express responds with 200 OK ──> React updates state: setPosts(posts.filter(p => p._id !== id))
```

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Payload | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Fetch all posts (newest first) | None | `200 OK` |
| `POST` | `/api/posts` | Create new post | `multipart/form-data` (`title`, `description`, optional `image`) | `201 Created` |
| `DELETE` | `/api/posts/:id` | Delete post by MongoDB `_id` | None | `200 OK` |
| `GET` | `/api/health` | Backend status check | None | `200 OK` |

---

## 🔐 Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus_posts
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api/posts
```

---

## ⚡ Execution Commands

### Terminal 1 (Backend):
```bash
cd server
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd client
npm run dev
```
