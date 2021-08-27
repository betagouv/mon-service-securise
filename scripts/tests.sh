#!/bin/bash -e

source scripts/variables.sh

docker run --rm -ti -e NODE_ENV=test -v $PWD:/usr/src/app ${DOCKER_IMAGE} \
  bash -c "npx knex migrate:rollback --all \
           && npx knex --env test migrate:latest \
           && npx mocha --recursive --watch"
