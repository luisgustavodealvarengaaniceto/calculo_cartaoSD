FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tailwind.config.js ./

# Install dependencies including tailwindcss
RUN npm install

# Copy all source files
COPY . .

# Create dist directory and build CSS
RUN mkdir -p dist && npm run build:css

# Install http-server
RUN npm install -g http-server

# Verify files
RUN echo "=== Files in /app ===" && ls -la && echo "=== Files in /app/dist ===" && ls -la dist/

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["http-server", ".", "-p", "8080", "--cors"]
