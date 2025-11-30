# Movie Review Platform

A full-stack movie review application built with Node.js, Express, MongoDB Atlas, and TMDB API. Users can discover movies, write reviews, and share ratings.

## Project Overview

This project was developed for my CPAN212 course, demonstrating backend development across three phases:

- Phase 1: Project setup & basic Express routes
- Phase 2: Modular architecture & business logic  
- Phase 3: MongoDB Atlas integration & database operations
- Phase 4: Frontend Integration with React
- Phase 5: Authentication & Authorization with MFA

## Features

### Authentication
- User registration and login with JWT tokens
- Password hashing with bcryptjs
- Protected routes with authentication

### Movie Management
- Browse popular movies from TMDB API
- Search movies by title, genre, or director (W.I.P)
- Local movie database with custom entries (W.I.P)

### Review System
- Write and edit movie reviews (1-5 stars)
- Comment on movies with text reviews
- View all reviews for a movie

### Technical Features
- Input validation with express-validator
- Error handling and proper HTTP status codes
- Pagination and search functionality
- Environment configuration

## Project Structure

```
backend/
  modules/                
    middlewares/     
  shared/
    middlewares/
      models/         

frontend/
  src/
    components/ 
  pages/ 
    context/ 
  App.jsx # Main app component
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
npm start

npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
```

### 2. Environment Configuration
Create `.env` file:
```
TMDB_API_KEY=
DB_URL=
JWT_SECRET=
GOOGLE_EMAIL=
GOOGLE_PASSWORD=
```

### 3. Start Server
```bash
npm run dev
```
Visit: http://localhost:3000

## API Endpoints

### Authentication
- POST /api/login - User login (Step 1: Send OTP)
- POST /api/verify-login - Verify OTP (Step 2: Get JWT)
- POST /api/resend-otp - Resend OTP email
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET /api/profile - Get current user profile
- GET /api/users - Get all users (Admin only)

### Movies
- GET `/api/movies` - Get all movies
- GET `/api/movies/:id` - Get movie by ID
- GET `/api/movies/search/:query` - Search movies
- POST `/api/movies` - Create new movie (Admin)

### Reviews
- GET `/api/reviews/movie/:id` - Get reviews for movie
- POST `/api/reviews` - Create review (Login required)
- PUT `/api/reviews/:id` - Update review (Owner only)
- DELETE `/api/reviews/:id` - Delete review (Owner only)

### TMDB Integration
- GET `/api/tmdb/status` - Check TMDB connection
- GET `/api/tmdb/movies/popular` - Get popular movies
- GET `/api/tmdb/movies/search?q=query` - Search TMDB movies

## Testing

### Quick Tests Using Postman
```bash
# Test server health
GET http://localhost:3000/api/health

# Test TMDB integration  
GET http://localhost:3000/api/tmdb/status

# Register a user
POST http://localhost:3000/api/register
Content-Type: application/json

{
"username": "testuser",
"email": "test@example.com",
"password": "password123"
}

# Test MFA Login Flow
# Step 1: Send credentials and get OTP
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# Step 2: Verify OTP and get JWT token
POST http://localhost:3000/api/verify-login
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}

# Test protected routes with JWT
GET http://localhost:3000/api/profile
Authorization: Bearer YOUR_JWT_TOKEN

# Test admin-only routes
GET http://localhost:3000/api/users
Authorization: Bearer ADMIN_JWT_TOKEN
```
## Technology Stack

- Backend: Node.js, Express.js
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcryptjs, OTP-based MFA
- Email Service: Nodemailer with Gmail
- Validation: express-validator
- External API: The Movie Database (TMDB)
- Frontend: React, React Router, Axios
- Styling: Custom CSS

### Phase 2 - Modular Architecture
- Separated business logic into model classes (MovieModel, UserModel, ReviewModel)
- Implemented input validation with express-validator
- Added comprehensive error handling middleware
- Created authentication middleware with JWT
- Implemented proper HTTP status codes and responses

### Phase 3 - MongoDB Atlas Integration
- Migrated from local MongoDB to cloud-based MongoDB Atlas
- Created database connection middleware
- Implemented Mongoose schemas with validation
- Added search, sort, and pagination features (W.I.P)
- Set up environment variables for secure configuration
- Replaced JSON file storage with MongoDB operations

### Phase 4 - Frontend Integration with React
- Built React frontend with component-based architecture
- Implemented client-side routing with React Router
- Integrated with backend API using Axios
- Added form validation and user feedback systems
- Created responsive UI for movie browsing and reviews (W.I.P)
- Implemented authentication flow in frontend
- Added error handling and loading states

### Phase 5 - Authentication & Authorization with MFA
- Implemented JWT-based authentication with secure token management
- Added Email-based Multi-Factor Authentication (MFA) using OTP
- Created Role-Based Access Control (RBAC) system with admin and user roles
- Enhanced security with password hashing and token expiration
- Built OTP management system with automatic expiration (5 minutes)
- Implemented protected routes with role-based middleware
- Added comprehensive error handling for authentication failures
- Created secure email service for OTP delivery using Nodemailer
- Enhanced frontend authentication flow with OTP verification page

## What I Learned

Through this project, I gained experience in:

- Backend architecture and modular design
- MongoDB schema design and relationships
- RESTful API development
- JWT authentication implementation
- Multi-Factor Authentication (MFA) systems
- Role-Based Access Control (RBAC)
- Email service integration
- Error handling and validation
- External API integration
- Cloud database deployment with MongoDB Atlas

## Future Enhancements
- Movie recommendation engine
- Social features
- Advanced search filters
- Admin dashboard


