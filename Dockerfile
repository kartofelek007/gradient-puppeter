# Use the official Node.js image as the base image
FROM node
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
     chromium \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g npm@9.8.1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 8080

# Set the working directory in the container
WORKDIR .

# Install the application dependencies
WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Define the entry point for the container
CMD ["npm", "start"]