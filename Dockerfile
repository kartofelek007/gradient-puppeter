# Filename: Dockerfile

FROM jrei/systemd-ubuntu:20.04

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
# ENV TZ=Europe/Poland
# RUN echo "Preparing geographic area ..."
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update
RUN apt-get install curl -y
RUN curl -LO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb
RUN rm google-chrome-stable_current_amd64.deb
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs

# FROM public.ecr.aws/lambda/nodejs:14.2022.09.09.11
# Create working directory
WORKDIR /usr/src/app

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