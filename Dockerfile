FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tailwind.config.js ./

# Install dependencies including tailwindcss
RUN npm install

# Verify tailwindcss is installed
RUN npm list tailwindcss

# Copy all source files
COPY . .

# Create dist directory and build CSS
RUN mkdir -p dist

# Check if styles.css exists
RUN ls -la styles.css

# Run build with verbose output
RUN echo "Running: npm run build:css" && npm run build:css || echo "Build failed, checking contents:"

# Check what was created
RUN echo "=== Contents of dist/ ===" && ls -laR dist/ && echo "=== Contents of /app ===" && ls -la /app/

# Install http-server
RUN npm install -g http-server

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["http-server", ".", "-p", "8080", "--cors"]
