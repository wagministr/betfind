FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Start development server by default
CMD ["npm", "run", "dev"] 