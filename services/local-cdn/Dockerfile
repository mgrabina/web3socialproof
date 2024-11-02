# Use the official Node.js image as the base
FROM node:18

# Create and set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose port 3000 for the server
EXPOSE 3001

# Run the server
CMD ["node", "server.js"]
