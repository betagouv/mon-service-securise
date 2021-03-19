#!/bin/sh -e

DOCKER_IMAGE=risques_mesures
PORT=${PORT:-1917}

docker build -t ${DOCKER_IMAGE} .
docker run --rm -p ${PORT}:80 -v $PWD:/usr/share/nginx/html ${DOCKER_IMAGE}
