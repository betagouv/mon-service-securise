#!/usr/bin/env bash

# Les règles de calcul de réduction de vraisemblance sont dans des Grist.
# Notre code attend un objet Typescript pour alimenter `new VraisemblanceRisque()`.
# Ce script transforme le CSV du Grist en JSON à placer dans le code source de MSS.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVPourVraisemblance.sh <chemin vers .csv> <identifiant du risque>`


FICHIER_CSV="$1"

IDENTIFIANT_RISQUE="$2"

if [ -z "$FICHIER_CSV" ] || [ -z "$IDENTIFIANT_RISQUE" ]; then
  echo "Usage : $0 <chemin vers .csv> <identifiant du risque>"
  exit 1
fi

FICHIER_TYPESCRIPT="$(dirname "$0")/../../src/moteurRisques/v2/vraisemblance.$IDENTIFIANT_RISQUE.configuration.ts"

{
  echo "import { ConfigurationVraisemblancePourUnVecteur, ConfigurationPredicatVraisemblance } from './vraisemblance.types.js';"
  echo "import { siTout, siAucune, siPasTout } from './vraisemblance.predicats.js';"
  echo ""
  echo "export const ${IDENTIFIANT_RISQUE}: ConfigurationVraisemblancePourUnVecteur ="

  mlr --icsv --ojson cat "$FICHIER_CSV" | jq -r '

  # Construction des colonnes par niveau
  def niveaux:
   {
     niveau1: "Basique : Réduction",
     niveau2: "Modéré : Réduction",
     niveau3: "Avancé : Réduction"
   };

  # Parse "1(d)" → {poids:1, groupe:"d"}
  def parse_groupe_et_poids:
   capture("(?<poids>[0-9]+)\\((?<groupe>[^)]+)\\)")
   | { poids: (.poids|tonumber), groupe };

  # Construction des groupes de mesures
  def groupes(col):
   map(select(.REF != "CALCUL" and .REF != "/" and .[col] != null and .[col] != ""))
   | map(. as $row
       | ($row[col] | parse_groupe_et_poids) as $r
       | { groupe: $r.groupe, poids: $r.poids, id: $row.REF }
     )
   | group_by(.groupe)
   | map({
       (.[0].groupe): {
         poids: .[0].poids,
         idsMesures: map(.id)
       }
     })
   | add;

  # Conversion des prédicats SI XXX → fonction métier
  def predicat_vers_fonction:
    ascii_downcase
    | gsub(" "; "")
    | if . == "tout" then "siTout"
      elif . == "aucune" then "siAucune"
      elif . == "pastout" then "siPasTout"
      else "si" + .
      end;

  # Conversion des formules vers fonction Typescript (support + et -)
  def formule_vers_typescript:
    sub("^V\\s*=\\s*"; "")
    | capture("(?<base>[0-9]+)\\s*(?<rest>.*)")
    | .base as $base
    | .rest
    # trouve tous les termes avec leur opérateur
    | [ match("([+-])\\s*([a-zA-Z])\\(SI ([^)]+)\\)"; "g") ]
    | map({
        op: .captures[0].string,
        grp: .captures[1].string,
        cond: .captures[2].string
      })
    | . as $terms
    | ($terms | map(.grp) | unique) as $groups
    | ($groups | map("poids" + ascii_upcase)) as $poidsVars
    | "({ " + ($groups + $poidsVars | join(", ")) + " }: ConfigurationPredicatVraisemblance) => "
      + $base
      + (
          $terms
          | map(
              " "
              + .op
              + " poids" + (.grp|ascii_upcase)
              + " * "
              + (.cond | predicat_vers_fonction)
              + "(" + .grp + ")"
            )
          | join("")
        );


  # Split les formules et convertit en typescript
  def decoupe_formules:
    split("//")
    | map(gsub("^\\s+|\\s+$"; ""))
    | map(select(length > 0))
    | map(formule_vers_typescript);

  # Extrait les formules de la ligne CALCUL
  def formules:
   map(select(.REF == "CALCUL"))[0] as $calc
   | {
     niveau1: ($calc[niveaux.niveau1] | decoupe_formules),
     niveau2: ($calc[niveaux.niveau2] | decoupe_formules),
     niveau3: ($calc[niveaux.niveau3] | decoupe_formules)
   };

  # Construit la sortie Typescript
  formules as $f
  | [
      { key: "niveau1", groupes: groupes(niveaux.niveau1), formules: $f.niveau1 },
      { key: "niveau2", groupes: groupes(niveaux.niveau2), formules: $f.niveau2 },
      { key: "niveau3", groupes: groupes(niveaux.niveau3), formules: $f.niveau3 }
    ]
  | map(select(
      (.groupes != null and (.groupes|length>0)) or (.formules|length>0)
    ))
  | map({
      (.key): {
        groupes: .groupes,
        formules: .formules
      }
    })
  | add
  | "{" ,
    (to_entries[] |
      "  \(.key): {\n"
      + "    groupes: " + (.value.groupes|tojson) + ",\n"
      + "    formules: [\n"
      + ( .value.formules | map("      " + .) | join(",\n") )
      + "\n    ]\n"
      + "  },"
    ),
    "}"
  '
} > "$FICHIER_TYPESCRIPT"