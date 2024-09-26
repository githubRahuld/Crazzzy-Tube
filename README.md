# CrazzzyTube - YouTube Clone

CrazzzyTube is a full-stack web application inspired by YouTube. It allows users to upload, stream, and interact with videos. The project is built using the MERN stack (MongoDB, Express.js, React, and Node.js) and incorporates video streaming capabilities using FFmpeg and Cloudinary for video storage.

## Features

- **User Authentication**: Users can sign up, log in, and log out securely.
- **Video Uploading**: Users can upload videos that are stored in Cloudinary.
- **Video Streaming**: Videos are streamed using FFmpeg and displayed with Video.js player.
- **User Profiles**: Users can manage their profiles, including uploading avatars and updating their information.
- **Playlists**: Create and manage playlists to organize videos.
- **Comments**: Users can leave comments on videos.
- **Likes and Subscriptions**: Users can like videos and subscribe to other users.
- **Tweets Integration**: Simple tweet-like feature where users can share thoughts related to the content.
- **Dashboard**: A user-specific dashboard where subscribers and subscription details are displayed.

## Tech Stack

- **Frontend**: React.js, NextUI, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Database**: MongoDB
- **Video Storage**: Cloudinary
- **Video Streaming**: FFmpeg, Video.js player
- **State Management**: Redux
- **Deployment**: Vercel (Frontend & Backend)

## Installation and Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [FFmpeg](https://ffmpeg.org/)
- [Cloudinary Account](https://cloudinary.com/)

### Clone the Repository

```bash
git clone https://github.com/githubRahuld/Crazzzy-Tube.git
cd crazzzy-tube

## Backend Setup
- **Navigate to the backend folder:**
    cd backend
- **Install dependencies:**
    npm install
- **Create a .env file and add the following environment variables:**
    MONGO_URI=your_mongodb_connection_string
    CLOUDINARY_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    JWT_SECRET=your_jwt_secret
- **Start the backend server:**
    npm start/npm run dev

## Frontend Setup
-**Navigate to the frontend folder:**
    cd frontend
- **Install dependencies:**
    npm install
- **Create a .env file for the frontend if necessary, for example:**
    VITE_BACKEND_URL=http://localhost:5000/api
- **Start the frontend server:**
    npm run dev

### Running the Project
    Make sure the backend server is running on port 5000.
    The frontend should be running on port 5173 by default. Open the browser and go to http://localhost:5173.
