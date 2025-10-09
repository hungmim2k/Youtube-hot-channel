# Database Connection Architecture

## Overview
This project uses **React with Vite** and connects directly to MongoDB using Mongoose from the client-side without a separate Node.js backend. This is an unconventional approach as database connections are typically handled on the server-side.

## Architecture
- **Frontend Framework**: React (v19.2.0)
- **Build Tool**: Vite
- **Database**: MongoDB
- **ODM**: Mongoose (v8.19.1)
- **Connection Type**: Direct client-side connection

## How It Works
1. The MongoDB connection string is stored in the `.env.local` file
2. Vite injects this environment variable into the client-side code during build
3. The React application connects directly to MongoDB using Mongoose
4. Several browser-compatibility fixes have been implemented to make Mongoose work in a browser environment:
   - Polyfill for `global` object
   - Polyfill for `mongoose.emitWarning` function
   - Checks for `mongoose.connection.on` before attaching event handlers
   - Checks for `process.on` before attaching SIGINT handlers

## Security Considerations
This approach has significant security implications:
- The MongoDB connection string is exposed to the client
- There is no server-side validation or rate limiting
- Authentication is handled on the client side

## Recommended Improvements
For a production environment, consider:
1. Moving database operations to a server-side API
2. Implementing proper authentication and authorization
3. Adding rate limiting and request validation
4. Using environment variables that are not exposed to the client

## Current Implementation
The current implementation works but should be considered for development or internal use only. The MongoDB connection is established in `database/connection.ts` and various models and services are defined in the `database/models` and `database/services` directories.