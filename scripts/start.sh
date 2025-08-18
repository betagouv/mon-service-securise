#!/usr/bin/env bash

NODE_VERSION="$(cat .nvmrc)" docker compose up web --build -d

docker logs -f mon-service-securise-web-1