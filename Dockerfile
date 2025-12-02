ARG NODE_VERSION=22

#checkov:skip=CKV_DOCKER_2:Uniquement utilisé en local pour le dev
#checkov:skip=CKV_DOCKER_3:Uniquement utilisé en local pour le dev
FROM docker.io/node:$NODE_VERSION

# La génération de PDF utilise Puppeteer pour se connecter à un navigateur distant
# **MAIS** on ne veut pas que Puppeteer déclenche le téléchargement d'un navigateur local.
ENV PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /usr/src/app
COPY package.json package-lock.json /usr/src/app/
RUN npm ci

COPY . /usr/src/app
EXPOSE 3000
CMD ["npm", "start"]
