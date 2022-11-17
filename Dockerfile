FROM node:16

RUN apt-get update && \
    apt-get install --yes texlive-latex-extra texlive-lang-european texlive-lang-french

RUN npm install -g npm

WORKDIR /usr/src/app
COPY package.json package-lock.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
EXPOSE 3000
CMD ["npm", "start"]
