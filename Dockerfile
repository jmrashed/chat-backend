# Stage 1: Build the application
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (without --production to ensure both dev and production dependencies are installed)
RUN npm install

RUN npm install -g dotenv-cli


# Copy the rest of the application code
COPY . .

# Stage 2: Create a production image
FROM node:22-alpine AS production

# Set the working directory
WORKDIR /app

# Copy necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/seeder.js ./seeder.js
COPY --from=build /app/.env ./

# Expose the application port
EXPOSE 3020

# Start the application
CMD ["node", "src/app.js"]
