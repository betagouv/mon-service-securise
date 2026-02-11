#!/usr/bin/env bash

# Les règles de sélection des OBJECTIFS VISÉS sont dans un Grist.
# Notre code attend un objet Typescript pour alimenter `SelectionVecteurs()`.
# Ce script transforme le CSV du Grist en JSON à placer dans le code source de MSS.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVPourSelectionObjectifsVises.sh <chemin vers .csv>`


FICHIER_CSV="$1"

FICHIER_TYPESCRIPT="$(dirname "$0")/../../src/moteurRisques/v2/selectionObjectifsVises.configuration.ts"

{
  echo "import type { ConfigurationSelectionObjectifsVises } from './selectionObjectifsVises.types.js';"
  echo ""
  echo "export const configurationSelectionObjectifsVises: ConfigurationSelectionObjectifsVises ="

  mlr --icsv --ojson cat "$FICHIER_CSV" | jq '

  def regle_optionnelle($cleRegle; $mapping):
    . as $root
    | ($mapping
        | with_entries(.value = $root[.value])
        | with_entries(select(.value != "N/A"))
      ) as $resultat
    | (
        if ($resultat | length) == 0
        then .
        else . + { ($cleRegle): $resultat }
        end
      )
    | reduce ($mapping | to_entries[] | .value) as $f (.; del(.[$f]));

  map(
    .presentInitialement = (.["Statut de base"] == "Présent")
    | del(.["Statut de base"])

    ################
    # Pour chaque objectif visé, on construit les règles, composées de modificateurs.
    # Puis on les placera sous `regles`.
    # Chaque règle garde seulement les modificateurs qui ont une valeur dans le CSV.

    | regle_optionnelle(
        "typeService";
        {
          portailInformation: "Effet : Portail d'\''information",
          serviceEnLigne: "Effet : Service en ligne"
        }
      )

    | regle_optionnelle(
        "specificitesProjet";
        {
          echangeOuReceptionEmails: "Effet : Mails"
        }
      )

    | del(
        .["Effet : Portail d'\''information"],
        .["Effet : Service en ligne"],
        .["Effet : Mails"],
        .["OV"]
      )

    | {(.["Réf"]): (del(.["Réf"]))}
  )

  | add

  # Crée le niveau `regles` dans chaque objectif visé
  | with_entries(
      .value |=
        (
          {
            presentInitialement: .presentInitialement,
            regles: (del(.presentInitialement))
          }
        )
    )

  '
} > "$FICHIER_TYPESCRIPT"