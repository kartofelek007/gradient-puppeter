# Filename: Dockerfile

FROM ghcr.io/puppeteer/puppeteer:16.1.0

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
# ENV TZ=Europe/Poland
# RUN echo "Preparing geographic area ..."
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create working directory
WORKDIR /usr/src/app
RUN node -v

# Copy package.json
COPY package.json ./

# Install NPM dependencies for function
RUN npm install

# Copy handler function and tsconfig
COPY app.js ./
COPY server.html ./

# Expose app
EXPOSE 8080

# Run app
CMD ["node", "app.js"]