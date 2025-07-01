#!/bin/bash

cd "$(dirname "$0")"

usage() {
  echo $0 >&2
  echo Erreur: "$@" >&2
  echo >&2
  echo Initialise le sel, à utiliser uniquement en développement >&2
  exit 1
}

grep -q CHIFFREMENT_SEL_DE_HASHAGE_1 ../.env && usage CHIFFREMENT_SEL_DE_HASHAGE_1 est déjà défini dans le fichier .env

SEL="$(cat /dev/random | head -c 10 | xxd -p)"

printf "\nCHIFFREMENT_SEL_DE_HASHAGE_1=$SEL" >> ../.env

HASH_DU_SEL="$(node ./dev-init-sel.js "$SEL")"

psql -h localhost -U postgres mss -c "insert into sels_de_hachage (version, empreinte) values (1, '$HASH_DU_SEL');"