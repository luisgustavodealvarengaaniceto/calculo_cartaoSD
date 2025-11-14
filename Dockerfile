# Use nginx alpine for lightweight image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy application files
COPY index.html .
COPY app.js .
COPY calculator.js .
COPY models.js .
COPY translations.js .
COPY styles.css .
COPY test.html .
COPY test.js .
COPY *.md ./
COPY *.json ./

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8084
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8084/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
