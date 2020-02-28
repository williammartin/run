FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

COPY . /app/
RUN npm run compile

ENTRYPOINT ["node", "/app/build/src/main.js"]
