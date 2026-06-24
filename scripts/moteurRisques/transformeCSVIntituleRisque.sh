#!/usr/bin/env bash

# Les intitulés de risques par Vecteur et OV sont dans un Grist.
# Notre code attend un objet Typescript pour alimenter `new RisqueV2()`.
# Ce script transforme le CSV du Grist en JSON à placer dans le code source de MSS.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVIntituleRisque.sh <chemin vers .csv>`


FICHIER_CSV="$1"

FICHIER_TYPESCRIPT="$(dirname "$0")/../../src/moteurRisques/v2/risqueV2.configuration.ts"

{
  echo "/* "
  echo "Fichier généré par scripts/moteurRisques/transformeCSVIntituleRisque.sh"
  echo "Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import { ConfigurationRisqueV2 } from './risquesV2.types.js';"
  echo ""
  echo "export const configurationRisqueV2: ConfigurationRisqueV2 ="

  mlr --icsv --ojson cat "$FICHIER_CSV" | jq '

  map(
    .intitule = .["Nom short"]
    | del(.["Nom short"])

    | .intitulesObjectifsVises = (
        {
          OV1: .["Défacement (si présent)"],
          OV2: .["Fuite ou falsification des informations"],
          OV3: .["Indisponibilité d'\''un ou plusieurs services du SI (si présent)"],
          OV4: .["Envoi de mails altérés (si présent)"]
        }
        | with_entries(select(.value != "NON"))
      )

    | del(
          ."Défacement (si présent)",
          ."Fuite ou falsification des informations",
          ."Indisponibilité d'\''un ou plusieurs services du SI (si présent)",
          ."Envoi de mails altérés (si présent)",
          .["SR + Point d'\''entrée"]
        )

    | {(.Ref): (del(.Ref))}
  )

  | add
'
} > "$FICHIER_TYPESCRIPT"