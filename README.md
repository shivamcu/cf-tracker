# CF Tracker

A full-stack web application for tracking and analyzing your Codeforces problem-solving progress.

## Overview

CF Tracker helps competitive programmers monitor their progress on Codeforces by:
- Displaying solved problems, statistics, and rankings
- Visualizing problem distribution by rating and topic
- Providing learning roadmaps to improve specific skills
- Bookmarking problems for later practice
- Filtering problems by rating, topic, and difficulty

## Tech Stack

**Frontend:**
- React 19 with Vite
- React Router v7.14.1 for navigation
- Axios for HTTP requests
- Recharts for data visualization
- CSS Modules for styling

**Backend:**
- Express 5.2.1 (Node.js)
- MongoDB with Mongoose 9.4.1 for data persistence
- JWT (jsonwebtoken 9.0.3) for authentication
- bcryptjs for password hashing
- Axios for Codeforces API integration
- CORS enabled for cross-origin requests

**External APIs:**
- Codeforces API (https://codeforces.com/api) for problem and user data

## Prerequisites

- **Node.js** 18+ (with npm or yarn)
- **MongoDB** 6.0+ (local or cloud instance, e.g., MongoDB Atlas)
- **Git** for version control

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd cf-tracker
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd cf-tracker-backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `cf-tracker-backend` directory:

```bash
# Copy the example file
cp .env.example cf-tracker-backend/.env
```

Then edit `cf-tracker-backend/.env` with your configuration:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/cf-tracker
JWT_SECRET=your-super-secret-key-change-this-in-production
```

**Environment Variables:**
- `PORT` - Backend server port (default: 5001)
- `MONGO_URI` - MongoDB connection string (local or cloud)
- `JWT_SECRET` - Secret key for JWT token signing (use a strong, random string in production)

## Running the Project

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd cf-tracker-backend
npm run dev
```
The backend runs on `http://localhost:5001` with hot-reload via Nodemon.

**Terminal 2 - Start Frontend Development Server:**
```bash
npm run dev
```
The frontend runs on `http://localhost:5173` with HMR (Hot Module Reload).

Navigate to `http://localhost:5173` in your browser.

### Production Build

**Build Frontend:**
```bash
npm run build
```
Creates optimized build in `dist/` directory.

**Start Backend (Production):**
```bash
cd cf-tracker-backend
npm start
```

## Project Structure

```
cf-tracker/
├── src/                              # Frontend React application
│   ├── components/                  # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Layout.jsx
│   │   ├── ProblemsList.jsx         # Modal for viewing problems
│   │   ├── PrivateRoute.jsx         # Protected routes
│   │   └── LoadingSpinner.jsx       # Animated loader
│   ├── pages/                       # Page components
│   │   ├── Home.jsx                 # Landing page
│   │   ├── Dashboard.jsx            # User profile with charts
│   │   ├── Problems.jsx             # Browse all problems
│   │   ├── Roadmap.jsx              # Learning path generator
│   │   ├── Login.jsx                # Authentication page
│   │   ├── Register.jsx             # Registration page
│   │   ├── Profile.jsx              # User settings
│   │   └── NotFound.jsx             # 404 page
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state
│   ├── styles/                      # CSS Module files
│   └── main.jsx                     # Entry point
├── cf-tracker-backend/               # Express backend
│   ├── server.js                    # Server entry point with middleware
│   ├── routes/                      # API route handlers
│   │   ├── auth.js                  # POST /auth/register, /auth/login
│   │   ├── user.js                  # GET /user/me, PUT /user/update, etc.
│   │   └── codeforces.js            # GET /cf/problems, /cf/roadmap, etc.
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   └── Bookmark.js
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   └── .env                         # Environment variables (NOT in git)
├── vite.config.js                   # Vite configuration with API proxy
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Get JWT token

### User Management
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/update` - Update Codeforces handle
- `POST /api/user/bookmark` - Bookmark a problem
- `GET /api/user/bookmarks` - Get user's bookmarks

### Codeforces Integration
- `GET /api/cf/problems` - Get all Codeforces problems
- `GET /api/cf/user/:handle/problems-by-tag/:tag` - Problems solved by tag
- `GET /api/cf/user/:handle/problems-by-rating/:rating` - Problems solved by rating
- `GET /api/cf/user/:handle` - Get user stats and solved problems
- `GET /api/cf/roadmap?topic=:topic&handle=:handle` - Generate learning roadmap

## Features

✅ **User Authentication** - Secure registration and login with JWT
✅ **Profile Management** - Link Codeforces account and track progress
✅ **Dashboard Analytics** - Visualize problems solved by rating and topic
✅ **Problem Browser** - Filter and search problems by tags and difficulty
✅ **Learning Roadmap** - AI-generated learning paths based on problem topics
✅ **Bookmarks** - Save problems for later practice
✅ **Public Dashboard** - View any user's profile without authentication
✅ **Error Handling** - Centralized error middleware with consistent responses
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Error Handling

The backend includes centralized error handling middleware that catches all exceptions and returns consistent JSON responses:

```json
{
  "message": "Error description",
  "status": 400
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials or token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email on registration)
- `500` - Server Error (unhandled exception)

## Deployment

### Deploy Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy the `dist/` folder to Vercel or Netlify
3. Set environment variable in deployment: `VITE_API_URL=https://your-backend.com`

### Deploy Backend (Railway/Render/EC2)
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`
4. Deploy and monitor logs

### MongoDB Setup
- **Local Development:** Install MongoDB locally or use Docker
- **Production:** Use MongoDB Atlas (cloud) for managed hosting

## Development Tips

- **Hot Reload:** Both frontend and backend support hot module reloading during development
- **Proxy Setup:** Frontend automatically proxies `/api` requests to backend at `http://localhost:5001`
- **Database:** Use MongoDB Atlas connection string for cloud database
- **Debugging:** Check browser console (frontend) and terminal logs (backend)

## Troubleshooting

**"Cannot GET /api/..."**
- Ensure backend is running on port 5001
- Check CORS configuration in `server.js`

**"Cannot connect to MongoDB"**
- Verify MongoDB is running locally or check cloud connection string
- Ensure `MONGO_URI` is correct in `.env`

**"Invalid token"**
- Tokens expire after 7 days
- User needs to log in again to get a new token
- Check that `JWT_SECRET` is the same in `.env`

**Codeforces API rate limiting**
- The API has rate limits (~5 requests per second)
- Cache results when possible to reduce API calls

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please check the troubleshooting section above or refer to the source code documentation.
