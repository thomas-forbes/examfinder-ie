# Use a Node.js base image with Chrome pre-installed
FROM ghcr.io/puppeteer/puppeteer:22.14.0

# Set working directory
WORKDIR /app

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY scraper.ts ./
COPY helpers.ts ./

# Create output directory
RUN mkdir -p /app/output

# Set Chrome executable path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Run the scraper
CMD ["bun", "run", "scraper.ts"]