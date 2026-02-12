#!/usr/bin/env bash

# La matrice de création de risque qui croise les Vecteurs et les OV est dans un Grist.
# Notre code attend un objet Typescript pour alimenter `GraviteVecteurs()`.
# Ce script transforme le CSV du Grist en JSON à placer dans le code source de MSS.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVPourMatriceVecteurOV.sh <chemin vers .csv>`


FICHIER_CSV="$1"

FICHIER_TYPESCRIPT="$(dirname "$0")/../../src/moteurRisques/v2/graviteVecteurs.configuration.ts"

{
  echo "import { MatriceVecteurOV } from './graviteVecteurs.js';"
  echo ""
  echo "export const matriceVecteurOV: MatriceVecteurOV ="

  mlr --icsv --ojson cat "$FICHIER_CSV" | jq '

  map(
    .OV1 = (.["Défacement (si présent)"] != "NON")
    | del(.["Défacement (si présent)"])

    | .OV2 = (.["Fuite ou falsification des informations"] != "NON")
    | del(.["Fuite ou falsification des informations"])

    | .OV3 = (.["Indisponibilité d'\''un ou plusieurs services du SI (si présent)"] != "NON")
    | del(.["Indisponibilité d'\''un ou plusieurs services du SI (si présent)"])

    | .OV4 = (.["Envoi de mails altérés (si présent)"] != "NON")
    | del(.["Envoi de mails altérés (si présent)"])


    | del(.Vecteur)

    | {(.Ref): (del(.Ref) | with_entries(select(.value == true)))}
  )

  | add

  | with_entries(
      .value |= (
        to_entries
        | map(select(.value == true) | .key)
    )
)
'
} > "$FICHIER_TYPESCRIPT"