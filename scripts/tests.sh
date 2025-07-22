#!/usr/bin/env bash

NODE_VERSION=$(cat .nvmrc) docker compose \
  up test --build
