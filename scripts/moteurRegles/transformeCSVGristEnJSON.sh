#!/usr/bin/env bash

# Les mesures du moteur V2 sont dans un Grist.
# Ce Grist s'exporte en CSV.
# De notre côté nous avons un référentiel en JSON.
# Cette commande Miller permet de faire le pont de CSV vers JSON.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVGristEnJSON.sh <chemin vers .csv>`

mlr --icsv --ojson cat "$1" | jq '

def lpad(n):
  tostring
  | if (n > length) then ((n - length) * "0") + . else . end;

map(
.["description"] = (.["Libellé singulier"] | gsub("\n";"<br>"))
| del(.["Libellé singulier"])
| .["descriptionLongue"] = (.["Description singulier"] | gsub("\n";"<br>") | gsub("\\[(?<label>[^]]+)\\]\\((?<url>[^)]+)\\)"; "<a href=\"" + .url + "\" target=\"_blank\" rel=\"noopener\">" + .label + "</a>"))
| del(.["Description singulier"])
| .["categorie"] = (.["Tag : Catégorie"] | ascii_downcase | gsub("é";"e"))
| del(.["Tag : Catégorie"])
| .["identifiantNumerique"] = (.["ID"] | tostring | lpad(4))
| del(.["ID"])
| .["referentiel"] = .["Tag : Acteur"]
| del(.["Tag : Acteur"])
| {(."Réf Catalogue"): (del(."Réf Catalogue"))})
| add'