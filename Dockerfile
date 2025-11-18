# Use Node.js official image as base
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files (if they exist)
COPY package*.json ./

# Install dependencies (if package.json exists)
RUN if [ -f package.json ]; then npm install; else npm install -g http-server; fi

# Copy all project files
COPY . .

# Expose port 8080 for the application
EXPOSE 8080

# Start the application
# If using http-server, it will serve the static files
CMD ["npx", "http-server", ".", "-p", "8080", "--cors"]
