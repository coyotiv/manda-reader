# Manda Reader

A fast, minimal content reader optimized for feeds (Hacker News, Substack, blogs) with built-in reading, bookmarking, and multi-device sync.

## Features

- **Feed Management**: Discover and subscribe to RSS/Atom feeds from any URL
- **Hacker News Integration**: Browse top stories, new posts, and best content
- **Built-in Reader**: Clean reading experience with reader view
- **Bookmarking**: Save articles for later with export functionality
- **Read Tracking**: Mark items as read/unread with sync across devices
- **Multi-device Sync**: User accounts keep your feeds and reading state synchronized
- **Minimal UI**: Clean, distraction-free interface focused on content

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: React, TypeScript, Mantine UI, React Query, Vite
- **Infrastructure**: Docker Compose

## Prerequisites

- Docker and Docker Compose installed
- Git

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd manda-reader
   ```

2. **Create environment files**:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Configure environment variables**:

   The `.env.example` files contain default values. Edit them if needed:

   **backend/.env**:

   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://mongodb:27017/manda-reader
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

   **frontend/.env**:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start all services**:

   ```bash
   docker-compose up
   ```

5. **Access the application**:

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017

## Development

The application runs entirely through Docker Compose for local development. All services (MongoDB, backend, and frontend) are containerized and configured to work together.

To stop the services:

```bash
docker-compose down
```

To rebuild containers after dependency changes:

```bash
docker-compose up --build
```

## License

MIT
