# Use the official Node.js image as the base image
FROM ghcr.io/puppeteer/puppeteer:latest
EXPOSE 8080

# Set the working directory in the container
WORKDIR .

# Install the application dependencies
WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Define the entry point for the container
CMD ["npm", "start"]