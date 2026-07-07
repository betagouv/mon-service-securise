#!/usr/bin/env bash

# Deux CSV alimentent ce script :
#   - le référentiel AE2690 (AE.csv) : une ligne par mesure AE2690 ;
#   - la correspondance ReCyf <-> AE2690 (RECYF_AE.csv) : les mesures ReCyf associées
#     à chaque mesure AE2690.
#
# Il en tire deux fichiers source Typescript :
#   - donneesReferentielMesuresAE2690.ts : l'objet `mesuresAE2690` (identifiant
#     AE2690 -> { description }) déclaré
#   - correspondanceMesuresReCyfVersAE2690.ts : la table IdMesureReCyf ->
#     IdMesureAE2690[]. C'est Typescript qui vérifie, à la compilation, que chaque
#     identifiant AE2690 de la table existe bien dans le référentiel.
#
# La relation est « 1 ReCyf pour N AE2690 ».
#
# Miller : https://miller.readthedocs.io/en/6.15.0/
#
# Utilisation :
#   ./transformeCorrespondanceAEEnTypescript.sh <AE.csv> <RECYF_AE.csv>

FICHIER_REFERENTIEL_CSV="${1:-}"
FICHIER_MAPPING_CSV="${2:-}"

if [ -z "$FICHIER_REFERENTIEL_CSV" ] || [ -z "$FICHIER_MAPPING_CSV" ]; then
  echo "Usage : $0 <AE.csv (référentiel)> <RECYF_AE.csv (correspondance)>"
  exit 1
fi

RACINE="$(dirname "$0")/../.."
FICHIER_REFERENTIEL_AE="$RACINE/src/mesures/referentielsExternes/donneesReferentielMesuresAE2690.ts"
FICHIER_CORRESPONDANCE="$RACINE/src/mesures/referentielsExternes/correspondanceMesuresReCyfVersAE2690.ts"

# Tri naturel d'un identifiant pointé : "2.C.1" avant "10.A.1",
CLE_TRI='def cleTri: [ splits("[.]") ] | map(if test("^[0-9]+$") then tonumber else . end);'

# Référentiel AE2690 : une entrée par mesure, triée par numérotation.
DONNEES_REFERENTIEL="$(
  mlr --infer-none --icsv --ojson cut -f 'ID,Contenu' "$FICHIER_REFERENTIEL_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["ID"] != null and .["ID"] != ""))
      | map({
          ae: .["ID"],
          description: (
            (.["Contenu"] // "")
            | gsub("^\\s+|\\s+$"; "")
            | gsub("\\r\\n|\\r|\\n"; "<br>")
            | gsub("\\t"; " ")
          )
        })
      | group_by(.ae) | map(.[0])
      | sort_by(.ae | cleTri)
    '
)"

# Correspondance ReCyf -> AE2690[] : la colonne "Réf AE" contient un ou
# plusieurs identifiants séparés par des virgules (et des espaces). On regroupe
# par mesure ReCyf au cas où elle apparaîtrait sur plusieurs lignes.
DONNEES_MAPPING="$(
  mlr --infer-none --icsv --ojson cut -f 'Réf New NIS2,Réf AE' "$FICHIER_MAPPING_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["Réf New NIS2"] != null and .["Réf New NIS2"] != ""))
      | map({
          recyf: .["Réf New NIS2"],
          ae: (
            (.["Réf AE"] // "")
            | split(",")
            | map(gsub("^\\s+|\\s+$"; ""))
            | map(select(length > 0))
          )
        })
      | group_by(.recyf)
      | map({ recyf: .[0].recyf, ae: (map(.ae) | add | unique | sort_by(cleTri)) })
      | sort_by(.recyf | cleTri)
    '
)"

# Référentiel AE2690
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceAEEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import { DonneesReferentielsMesuresAE2690 } from '../../referentielV2.js';"
  echo ""
  echo "export const mesuresAE2690 = {"
  echo "$DONNEES_REFERENTIEL" | jq -r '.[] | "  \u0027" + .ae + "\u0027: { description: " + (.description | @json) + " },"'
  echo "} as const satisfies Record<string, DonneesReferentielsMesuresAE2690>;"
  echo ""
  echo "export type IdMesureAE2690 = keyof typeof mesuresAE2690;"
} > "$FICHIER_REFERENTIEL_AE"

# Table de correspondance IdMesureReCyf -> IdMesureAE2690[]
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceAEEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import type { IdMesureReCyf } from './donneesReferentielMesuresReCyf.js';"
  echo "import type { IdMesureAE2690 } from './donneesReferentielMesuresAE2690.js';"
  echo ""
  echo "export const correspondanceMesuresReCyfVersAE2690: Partial<Record<"
  echo "  IdMesureReCyf,"
  echo "  IdMesureAE2690[]"
  echo ">> = {"
  echo "$DONNEES_MAPPING" | jq -r '.[] | "  \u0027" + .recyf + "\u0027: [" + (.ae | map("\u0027" + . + "\u0027") | join(", ")) + "],"'
  echo "};"
} > "$FICHIER_CORRESPONDANCE"

# Mise au format du projet (prettier), pour des fichiers directement commitables.
npx --no-install prettier --write "$FICHIER_REFERENTIEL_AE" "$FICHIER_CORRESPONDANCE" >/dev/null

echo "Généré :" >&2
echo "  - $FICHIER_REFERENTIEL_AE ($(echo "$DONNEES_REFERENTIEL" | jq 'length') mesures AE2690)" >&2
echo "  - $FICHIER_CORRESPONDANCE ($(echo "$DONNEES_MAPPING" | jq 'length') mesures ReCyf)" >&2
