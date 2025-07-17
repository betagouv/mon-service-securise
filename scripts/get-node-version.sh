#!/usr/bin/env bash

VERSION=$(cat .nvmrc)
# On s'assure que ce qui est lu dans ce fichier respecte bien le format d'une version sémantique
if [[ $VERSION =~ ^(([0-9]{1,}\.){1,2})?[0-9]{1,}$ ]]; then
  echo "$VERSION"
else
  >&2 echo "Invalid version format for Node.js"
fi
