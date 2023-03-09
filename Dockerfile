FROM node:18

RUN apt-get update && \
    apt-get install --yes chromium

RUN npm install -g npm

WORKDIR /usr/src/app
COPY package.json package-lock.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
EXPOSE 3000
CMD ["npm", "start"]
