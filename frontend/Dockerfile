FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5173

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]

