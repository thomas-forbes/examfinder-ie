# Use Puppeteer's official image with Chrome pre-installed
FROM ghcr.io/puppeteer/puppeteer:22.14.0

# Set working directory
WORKDIR /app

# Install Node.js LTS (Puppeteer image uses a minimal Node setup)
USER root

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Create data directory
RUN mkdir -p /app/data && chown -R pptruser:pptruser /app

# Switch to non-root user
USER pptruser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]