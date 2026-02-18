# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from marketpulse-logic subfolder
COPY marketpulse-logic/package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source files from marketpulse-logic subfolder
COPY marketpulse-logic/ .

# Expose port (Render uses PORT env variable)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
