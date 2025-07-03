 # Whiteboard Assessment

This project is a collaborative whiteboard application with a React frontend and a Node.js/Express backend. It supports real-time drawing and room-based collaboration.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Structure
```
Whiteboard-assesment/
  client/      # React frontend
  server/      # Node.js backend
  README.md    # This file
  .gitignore   # Git ignore rules
```

## Prerequisites
- Node.js (v14 or higher recommended)
- npm (comes with Node.js)
- MongoDB (for backend)

## Environment Variables

### Backend (`server/.env`)
Copy `server/.env.template` to `server/.env` and fill in the values. Example:
```
PORT=5000
MONGODB_URI=mongodb+srv://ankit:Ankit%402310@cluster0.1x9ht85.mongodb.net/collaborative-whiteboard?retryWrites=true&w=majority&appName=Cluster0
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```
- **PORT**: Port for backend server (default: 5000)
- **MONGODB_URI**: MongoDB connection string
- **CLIENT_URL**: URL where the frontend is running
- **NODE_ENV**: Set to 'development' or 'production'

### Frontend (`client/.env`)
Copy `client/.env.template` to `client/.env` and fill in the values. Example:
```
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
```
- **REACT_APP_SERVER_URL**: Backend server URL
- **REACT_APP_API_URL**: Backend API base URL

---

## Setup Instructions

### Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Ensure MongoDB is running locally or update `MONGO_URI` in `.env` for a remote database.
4. Start the backend server:
   ```sh
   npm start
   ```
   The backend will run on the port specified in `.env` (default: 5000).

### Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend React app:
   ```sh
   npm start
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000) by default.

---

## Running the Application
- Make sure both backend and frontend are running (see above).
- Open your browser and go to [http://localhost:3000](http://localhost:3000).
- You can join or create a whiteboard room and start collaborating in real time.

---

## Usage
- **Join/Create Room:** Enter a room code to join or create a new whiteboard room.
- **Draw:** Use the toolbar to select drawing tools and colors.
- **Real-time Collaboration:** See other users' cursors and drawings live.

---

## Troubleshooting
- **Port Conflicts:** Make sure ports 3000 (frontend) and 5000 (backend) are free.
- **MongoDB Issues:** Ensure MongoDB is running and accessible at the URI specified in `.env`.
- **Environment Variables:** Double-check your `.env` files in both `client` and `server`.

---

## License
This project is for assessment and educational purposes.
