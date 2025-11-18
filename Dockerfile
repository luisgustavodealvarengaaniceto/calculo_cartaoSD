FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install http-server
RUN npm install -g http-server

# Verify dist folder exists
RUN ls -la dist/ && wc -c dist/output.css

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["http-server", ".", "-p", "8080", "--cors"]
