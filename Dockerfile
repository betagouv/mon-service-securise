ARG NODE_VERSION=22

#checkov:skip=CKV_DOCKER_2:Uniquement utilisé en local pour le dev
#checkov:skip=CKV_DOCKER_3:Uniquement utilisé en local pour le dev
FROM docker.io/node:$NODE_VERSION

RUN apt-get update -y
RUN apt-get install -y \
  jq

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml /usr/src/app/
RUN npm install -g "$(jq -r '.packageManager' package.json)"
RUN pnpm install

COPY . /usr/src/app
EXPOSE 3000
CMD ["pnpm", "start"]
