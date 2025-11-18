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

# Build CSS with Tailwind
RUN npm run build:css

# Final stage - Use lightweight http-server
FROM node:18-alpine

WORKDIR /app

# Install http-server globally
RUN npm install -g http-server

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/*.html ./
COPY --from=builder /app/*.js ./
COPY --from=builder /app/*.json ./
COPY --from=builder /app/*.md ./

# Copy other assets
COPY --from=builder /app/styles.css ./

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["http-server", ".", "-p", "8080", "--cors"]
