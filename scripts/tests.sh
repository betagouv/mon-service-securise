#!/usr/bin/env bash

docker compose \
  up test --build --build-arg "NODE_VERSION=$(cat .nvmrc)"
