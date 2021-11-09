#!/bin/bash -e

source scripts/variables.sh

docker run --rm -ti -e NODE_ENV=test -v $PWD:/usr/src/app ${DOCKER_IMAGE} npx mocha --recursive --watch
