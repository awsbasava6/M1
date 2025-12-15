FROM node:18-alpine

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source
COPY . .

# App port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production

CMD ["node", "index.js"]

