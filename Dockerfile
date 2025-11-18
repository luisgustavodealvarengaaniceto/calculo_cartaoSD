# Use Node.js official image as base for building
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tailwind.config.js ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Create dist directory
RUN mkdir -p dist

# Build CSS with Tailwind
RUN npm run build:css

# Verify the file was created
RUN ls -la dist/ && cat dist/output.css | head -5

# Final stage - Use lightweight http-server
FROM node:18-alpine

WORKDIR /app

# Install http-server globally
RUN npm install -g http-server

# Copy built files from builder - INCLUDING dist folder with the CSS file
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/*.html ./
COPY --from=builder /app/*.js ./
COPY --from=builder /app/*.css ./
COPY --from=builder /app/*.json ./
COPY --from=builder /app/*.md ./

# Verify files copied correctly
RUN echo "=== Checking dist folder ===" && ls -la dist/ && echo "=== Checking CSS file ===" && head -5 dist/output.css

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["http-server", ".", "-p", "8080", "--cors"]
