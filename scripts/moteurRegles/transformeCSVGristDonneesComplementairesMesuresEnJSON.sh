#!/usr/bin/env bash

# Les données complémentaires des mesures du moteur V2 sont dans un Grist.
# Ce Grist s'exporte en CSV.
# De notre côté nous avons un référentiel en JSON.
# Cette commande Miller permet de faire le pont de CSV vers JSON.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVGristDonneesComplementairesMesuresEnJSON.sh <chemin vers .csv>`

mlr --icsv --ojson cat "$1" | jq '

map(
  {
    (."Réf Catalogue"): {
      porteursSinguliers:
        (
          (."Tag : Porteur" // "")
          | split(",")
          | map(gsub("^\\s+|\\s+$"; ""))        # trim les espaces
          | map(select(length > 0))             # enlève les entrées vides
          | map(if . == "Personne responsable de la sécurité" then "RSSI" else . end)
        ),
      thematique: (."Tag : Filtre MSS")
    }
  }
)
| add
'