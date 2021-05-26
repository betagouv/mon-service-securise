#!/bin/bash -e

source scripts/variables.sh

docker run --rm -ti -v $PWD:/usr/src/app ${DOCKER_IMAGE} node_modules/.bin/mocha --recursive --watch
