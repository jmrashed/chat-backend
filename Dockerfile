# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
 
RUN npm install
 
COPY . .

# Expose the port the app runs on
EXPOSE 3020

# Command to run the app
CMD ["node", "src/app.js"]
