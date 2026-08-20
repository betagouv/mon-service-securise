#!/usr/bin/env bash

# Deux CSV alimentent ce script :
#   - le référentiel CyFun23 (CyFun23.csv) : une ligne par mesure CyFun23 ;
#   - la correspondance ReCyf <-> CyFun23 (RECYF_CYFUN.csv) : les mesures ReCyf associées
#     à chaque mesure CyFun23.
#
# Il en tire deux fichiers source Typescript :
#   - donneesReferentielMesuresCyFun23.ts : l'objet `mesuresCyFun23` (identifiant
#     CyFun23 -> { description }) déclaré
#   - correspondanceMesuresReCyfVersCyFun23.ts : la table IdMesureReCyf ->
#     IdMesureCyFun23[]. C'est Typescript qui vérifie, à la compilation, que chaque
#     identifiant CyFun23 de la table existe bien dans le référentiel.
#
# La relation est « 1 ReCyf pour N CyFun23 ».
#
# Miller : https://miller.readthedocs.io/en/6.15.0/
#
# Utilisation :
#   ./transformeCorrespondanceCyFunEnTypescript.sh <CyFun23.csv> <RECYF_CYFUN.csv>

FICHIER_REFERENTIEL_CSV="${1:-}"
FICHIER_MAPPING_CSV="${2:-}"

if [ -z "$FICHIER_REFERENTIEL_CSV" ] || [ -z "$FICHIER_MAPPING_CSV" ]; then
  echo "Usage : $0 <CyFun23.csv (référentiel)> <RECYF_CYFUN.csv (correspondance)>"
  exit 1
fi

RACINE="$(dirname "$0")/../.."
FICHIER_REFERENTIEL_CYFUN="$RACINE/src/mesures/referentielsExternes/donneesReferentielMesuresCyFun23.ts"
FICHIER_CORRESPONDANCE="$RACINE/src/mesures/referentielsExternes/correspondanceMesuresReCyfVersCyFun23.ts"

# Tri naturel d'un identifiant pointé : "2.C.1" avant "10.A.1",
CLE_TRI='def cleTri: [ splits("[.]") ] | map(if test("^[0-9]+$") then tonumber else . end);'

# Référentiel CyFun23 : une entrée par mesure, triée par numérotation.
DONNEES_REFERENTIEL="$(
  mlr --infer-none --icsv --ojson cut -f 'ID,Contenu' "$FICHIER_REFERENTIEL_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["ID"] != null and .["ID"] != ""))
      | map({
          cyfun: .["ID"],
          description: (
            (.["Contenu"] // "")
            | gsub("^\\s+|\\s+$"; "")
            | gsub("\\r\\n|\\r|\\n"; "<br>")
            | gsub("\\t"; " ")
          )
        })
      | group_by(.cyfun) | map(.[0])
      | sort_by(.cyfun | cleTri)
    '
)"

# Correspondance ReCyf -> CyFun23[] : la colonne "Réf CyFun23" contient un ou
# plusieurs identifiants séparés par des virgules (et des espaces). On regroupe
# par mesure ReCyf au cas où elle apparaîtrait sur plusieurs lignes.
DONNEES_MAPPING="$(
  mlr --infer-none --icsv --ojson cut -f 'Réf NIS2,Réf CyFun23' "$FICHIER_MAPPING_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["Réf NIS2"] != null and .["Réf NIS2"] != ""))
      | map({
          recyf: .["Réf NIS2"],
          cyfun: (
            (.["Réf CyFun23"] // "")
            | split(",")
            | map(gsub("^\\s+|\\s+$"; ""))
            | map(select(length > 0))
          )
        })
      | group_by(.recyf)
      | map({ recyf: .[0].recyf, cyfun: (map(.cyfun) | add | unique | sort_by(cleTri)) })
      | sort_by(.recyf | cleTri)
    '
)"

# Référentiel CyFun23
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceCyFunEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import { DonneesReferentielsMesuresCyFun23 } from '../../referentielV2.js';"
  echo ""
  echo "export const mesuresCyFun23 = {"
  echo "$DONNEES_REFERENTIEL" | jq -r '.[] | "  \u0027" + .cyfun + "\u0027: { description: " + (.description | @json) + " },"'
  echo "} as const satisfies Record<string, DonneesReferentielsMesuresCyFun23>;"
  echo ""
  echo "export type IdMesureCyFun23 = keyof typeof mesuresCyFun23;"
} > "$FICHIER_REFERENTIEL_CYFUN"

# Table de correspondance IdMesureReCyf -> IdMesureCyFun23[]
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceCyFunEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import type { IdMesureReCyf } from './donneesReferentielMesuresReCyf.js';"
  echo "import type { IdMesureCyFun23 } from './donneesReferentielMesuresCyFun23.js';"
  echo ""
  echo "export const correspondanceMesuresReCyfVersCyFun23: Partial<Record<"
  echo "  IdMesureReCyf,"
  echo "  IdMesureCyFun23[]"
  echo ">> = {"
  echo "$DONNEES_MAPPING" | jq -r '.[] | "  \u0027" + .recyf + "\u0027: [" + (.cyfun | map("\u0027" + . + "\u0027") | join(", ")) + "],"'
  echo "};"
} > "$FICHIER_CORRESPONDANCE"

# Mise au format du projet (prettier), pour des fichiers directement commitables.
npx --no-install prettier --write "$FICHIER_REFERENTIEL_CYFUN" "$FICHIER_CORRESPONDANCE" >/dev/null

echo "Généré :" >&2
echo "  - $FICHIER_REFERENTIEL_CYFUN ($(echo "$DONNEES_REFERENTIEL" | jq 'length') mesures CyFun23)" >&2
echo "  - $FICHIER_CORRESPONDANCE ($(echo "$DONNEES_MAPPING" | jq 'length') mesures ReCyf)" >&2
