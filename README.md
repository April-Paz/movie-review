# Movie Review Platform

A full-stack movie review application built with Node.js, Express, MongoDB Atlas, and TMDB API. Users can discover movies, write reviews, and share ratings.

## Project Overview

This project was developed for my CPAN212 course, demonstrating backend development across three phases:

- Phase 1: Project setup & basic Express routes
- Phase 2: Modular architecture & business logic  
- Phase 3: MongoDB Atlas integration & database operations

## Features

### Authentication
- User registration and login with JWT tokens
- Password hashing with bcryptjs
- Protected routes with authentication

### Movie Management
- Browse popular movies from TMDB API
- Search movies by title, genre, or director
- Local movie database with custom entries

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
  models/           # Mongoose schemas
  models/          # Business logic layer
  routes/          # Express routers
  middleware/      # Custom middleware
  shared/          # Shared middleware
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file:
```
TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 3. Start Server
```bash
npm run dev
```
Visit: http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

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
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
"username": "testuser",
"email": "test@example.com",
"password": "password123"
}
```
## Technology Stack

- Backend: Node.js, Express.js
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcryptjs
- Validation: express-validator
- External API: The Movie Database (TMDB)

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
- Added search, sort, and pagination features
- Set up environment variables for secure configuration

## What I Learned

Through this project, I gained experience in:

- Backend architecture and modular design
- MongoDB schema design and relationships
- RESTful API development
- JWT authentication implementation
- Error handling and validation
- External API integration
- Cloud database deployment with MongoDB Atlas

## Future Enhancements

- Frontend React application
- Movie recommendation engine
- Social features
- Advanced search filters
- Admin dashboard

---
