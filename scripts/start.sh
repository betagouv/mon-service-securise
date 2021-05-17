#!/bin/bash -e

source scripts/variables.sh

PORT=${PORT:-1917}

docker build -t ${DOCKER_IMAGE} .
docker run --rm -ti -p ${PORT}:3000 -v $PWD:/usr/src/app ${DOCKER_IMAGE} $*
