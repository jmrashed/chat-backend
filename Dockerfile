# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./
 
RUN npm install
 
COPY . .

# Expose the port the app runs on
EXPOSE 3020

# Command to run the app
CMD ["node", "src/app.js"]
