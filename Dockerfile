FROM node:14-alpine
RUN apk add git ffmpeg
WORKDIR /srv
COPY package*.json ./

ARG TOKEN
RUN npm config set @ilefa:registry=https://npm.pkg.github.com
RUN echo "//npm.pkg.github.com/:_authToken=${TOKEN}" > /srv/.npmrc
RUN npm install

COPY . .
CMD [ "npm", "start" ]