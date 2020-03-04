# for now: use Ubuntu instead of Alpine to have better control of Node + Python versions
FROM ubuntu:18.04

ENV PORT         9001
ENV NVM_VERSION  0.35.2
ENV NODE_VERSION 11.15.0

RUN apt-get update && \
    apt-get -y install curl python3.7 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install a fixed version of node
ENV NVM_DIR /usr/local/nvm
ENV NVM_INSTALL_PATH $NVM_DIR/versions/node/v$NODE_VERSION
RUN mkdir $NVM_DIR && curl -s -o- "https://raw.githubusercontent.com/creationix/nvm/v${NVM_VERSION}/install.sh" | bash

# Expose installed node as default
ENV NODE_PATH $NVM_INSTALL_PATH/lib/node_modules
ENV PATH $NVM_INSTALL_PATH/bin:$PATH

WORKDIR /app

# install latest version of the storyscript compiler
RUN python3.7 -m pip install storyscript

COPY package.json package-lock.json /app/
RUN  npm install

ADD . /app
RUN npm run compile

CMD ["node", "/app/build/src/main.js"]
