# DevPulse - Issue Tracking API

DevPulse is a backend API for a collaborative software issue-tracking platform. It allows users to report bugs, suggest features, and coordinate resolutions.

## Features
- User Authentication (Signup & Login)
- Role-based Access Control (Contributor & Maintainer)
- Issue Creation and Management
- Secure Password Hashing (Bcrypt)
- JWT-based Authentication

## Technology Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (using `pg` driver with raw SQL)
- **Security:** bcrypt, jsonwebtoken

## Setup Instructions
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a PostgreSQL database and configure the `.env` file.
4. Run `npm run dev` to start the server locally on port 5000.

## API Endpoints
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/issues` - Create a new issue (Protected)
- `GET /api/issues` - Get all issues (Public)
- `GET /api/issues/:id` - Get a single issue (Public)
- `PATCH /api/issues/:id` - Update an issue (Protected)
- `DELETE /api/issues/:id` - Delete an issue (Maintainer only)