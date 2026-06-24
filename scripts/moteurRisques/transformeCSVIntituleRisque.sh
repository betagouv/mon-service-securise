#!/usr/bin/env bash

# Les intitulés de risques par Vecteur et OV sont dans un Grist.
# Les descriptions et exemples de risques sont dans un second Grist.
# Notre code attend un objet Typescript pour alimenter `new RisqueV2()`.
# Ce script transforme les deux CSV du Grist en JSON à placer dans le code source de MSS.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVIntituleRisque.sh <chemin vers intitulés .csv> <chemin vers descriptions .csv>`


FICHIER_CSV="$1"
FICHIER_DESCRIPTIONS_CSV="$2"

FICHIER_TYPESCRIPT="$(dirname "$0")/../../src/moteurRisques/v2/risqueV2.configuration.ts"

# On indexe les descriptions et exemples par Réf (V1, V2, V3...) pour les associer aux intitulés.
DESCRIPTIONS_JSON="$(mlr --icsv --ojson cat "$FICHIER_DESCRIPTIONS_CSV")"

{
  echo "/* "
  echo "  Fichier généré par scripts/moteurRisques/transformeCSVIntituleRisque.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import { ConfigurationRisqueV2 } from './risquesV2.types.js';"
  echo ""
  echo "export const configurationRisqueV2: ConfigurationRisqueV2 ="

  mlr --icsv --ojson cat "$FICHIER_CSV" | jq --argjson descriptions "$DESCRIPTIONS_JSON" '

  def nettoie: (gsub("\t"; "") | gsub("\n"; "<br>"));

  ($descriptions | map({(.["Réf"]): {description: .Description, exemple: .Exemple}}) | add) as $parRef

  | map(
    .intitule = .["Nom short"]
    | del(.["Nom short"])

    | .description = ($parRef[.Ref].description | nettoie)
    | .exemple = ($parRef[.Ref].exemple | nettoie)

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
