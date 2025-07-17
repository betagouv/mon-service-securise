#!/usr/bin/env bash

docker compose \
  up web --build --build-arg "NODE_VERSION=$(cat .nvmrc)"
