
# Stage 1: Build the application
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (consider using --production if you don't need devDependencies)
RUN npm install --production


# Copy the rest of the application code
COPY . .

# Stage 2: Create a production image
FROM node:22-alpine AS production

# Set the working directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/seeder.js ./seeder.js

# Install only production dependencies in the final image
RUN npm install --production

# Expose the application port
EXPOSE 3020

# Start the application
CMD ["node", "src/app.js"]