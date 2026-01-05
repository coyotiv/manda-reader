FROM node:20-alpine

WORKDIR /app

# Update package index and install/update CA certificates for SSL verification
RUN apk update && apk add --no-cache ca-certificates && update-ca-certificates

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]

