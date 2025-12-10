#!/usr/bin/env bash

# Les liens entre les mesures du moteur V1 et V2 sont dans un Grist.
# Ce Grist s'exporte en CSV.
# De notre côté nous avons une table de conversion en JSON.
# Cette commande Miller permet de faire le pont de CSV vers JSON.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeLienV1V2EnJSON.sh <chemin vers .csv>`

mlr --icsv --ojson cat $1 | jq '
map(
del(.["Libellé MSS v1"])
| del(.Niveau)
| del(.["+n"])
| del(.["Libellé MSS v2"])
| del(.Commentaire)
| .idsMesureV2 = (.["REF MSS v2"] | split(",") | map(. | gsub("^\\s+|\\s+$"; "")))
| del(.["REF MSS v2"])
| .statut = (if .Evaluation == "Conforme" then "inchangee"
                     elif .Evaluation == "Modification mineure" then "inchangee"
                     elif .Evaluation == "Modification majeure" then "modifiee"
                     elif .Evaluation == "Conforme + Split" then "modifiee"
                     elif .Evaluation == "Split" then "supprimee"
                     elif .Evaluation == "Réunification" then "supprimee"
                     elif .Evaluation == "Absente" then "supprimee"
                     else .Evaluation end)
| .detailStatut = (if .Evaluation == "Conforme" then "conforme"
                     elif .Evaluation == "Modification mineure" then "modificationMineure"
                     elif .Evaluation == "Modification majeure" then "modificationMajeure"
                     elif .Evaluation == "Conforme + Split" then "conformeSplit"
                     elif .Evaluation == "Split" then "split"
                     elif .Evaluation == "Réunification" then "reunification"
                     elif .Evaluation == "Absente" then "absente"
                     else .Evaluation end)
| del(.Evaluation)
| .conservationDonnees = (if .["Conservation des données"] == "Oui" then true
                     else false end)
| del(.["Conservation des données"])
| del(.["Split sur différents niveaux"])
| if .conservationDonnees == false
    then del(.idMesureV2)
    else .
  end
| {(."REF MSS v1"): (del(."REF MSS v1"))})
| add'