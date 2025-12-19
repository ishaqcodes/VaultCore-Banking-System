# Use Node.js 22 alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose the application port
EXPOSE 5173

# Start the application with host flag for Docker access
CMD ["npm", "run", "dev", "--", "--host"]