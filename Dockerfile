# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the application source code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the Vite development server (listening on all network interfaces)
CMD ["npm", "run", "dev", "--", "--host"]
