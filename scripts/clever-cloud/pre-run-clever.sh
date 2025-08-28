#! /bin/sh

npx knex migrate:latest
npm run build:cree-utilisateur-demo
