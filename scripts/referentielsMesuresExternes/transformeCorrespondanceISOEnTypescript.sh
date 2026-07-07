#!/usr/bin/env bash

# Deux CSV alimentent ce script :
#   - le référentiel ISO2700X (ISO.csv) : une ligne par mesure ISO2700X ;
#   - la correspondance ReCyf <-> ISO2700X (RECYF_ISO.csv) : les mesures ReCyf associées
#     à chaque mesure ISO2700X.
#
# Il en tire deux fichiers source Typescript :
#   - donneesReferentielMesuresISO2700X.ts : l'objet `mesuresISO2700X` (identifiant
#     ISO2700X -> { description }) déclaré
#   - correspondanceMesuresReCyfVersISO2700X.ts : la table IdMesureReCyf ->
#     IdMesureISO2700X[]. C'est Typescript qui vérifie, à la compilation, que chaque
#     identifiant ISO2700x de la table existe bien dans le référentiel.
#
# La relation est « 1 ReCyf pour N ISO2700X ».
#
# Miller : https://miller.readthedocs.io/en/6.15.0/
#
# Utilisation :
#   ./transformeCorrespondanceISOEnTypescript.sh <ISO.csv> <RECYF_ISO.csv>

FICHIER_REFERENTIEL_CSV="${1:-}"
FICHIER_MAPPING_CSV="${2:-}"

if [ -z "$FICHIER_REFERENTIEL_CSV" ] || [ -z "$FICHIER_MAPPING_CSV" ]; then
  echo "Usage : $0 <ISO.csv (référentiel)> <RECYF_ISO.csv (correspondance)>"
  exit 1
fi

RACINE="$(dirname "$0")/../.."
FICHIER_REFERENTIEL_ISO="$RACINE/src/mesures/referentielsExternes/donneesReferentielMesuresISO2700X.ts"
FICHIER_CORRESPONDANCE="$RACINE/src/mesures/referentielsExternes/correspondanceMesuresReCyfVersISO2700X.ts"

# Tri naturel d'un identifiant pointé : "2.C.1" avant "10.A.1",
CLE_TRI='def cleTri: [ splits("[.]") ] | map(if test("^[0-9]+$") then tonumber else . end);'

# Référentiel ISO2700x : une entrée par mesure, triée par numérotation.
DONNEES_REFERENTIEL="$(
  mlr --icsv --ojson cut -f 'Nouvelle ref,Nouveau contenu' "$FICHIER_REFERENTIEL_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["Nouvelle ref"] != null and .["Nouvelle ref"] != ""))
      | map({
          iso: .["Nouvelle ref"],
          description: (
            (.["Nouveau contenu"] // "")
            | gsub("^\\s+|\\s+$"; "")
            | gsub("\\r\\n|\\r|\\n"; "<br>")
            | gsub("\\t"; " ")
          )
        })
      | group_by(.iso) | map(.[0])
      | sort_by(.iso | cleTri)
    '
)"

# Correspondance ReCyf -> ISO2700x[] : la colonne "Réf ISO 27001 & 27002" mélange
# identifiants et descriptions (avec virgules et guillemets internes), on se contente
# donc d'extraire les identifiants ISO2700x (motif "2700{1,2}:AAAA-x.y.z") plutôt que
# de découper la cellule sur les virgules.
DONNEES_MAPPING="$(
  mlr --icsv --ojson cut -f 'Réf New NIS2,Réf ISO 27001 & 27002' "$FICHIER_MAPPING_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["Réf New NIS2"] != null and .["Réf New NIS2"] != ""))
      | map({
          recyf: .["Réf New NIS2"],
          iso: [(.["Réf ISO 27001 & 27002"] // "") | scan("2700[12]:[0-9]{4}-[0-9]+(?:\\.[0-9]+)*")]
        })
    '
)"

# Référentiel ISO2700x
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceISOEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import { DonneesReferentielsMesuresISO2700X } from '../../referentielV2.js';"
  echo ""
  echo "export const mesuresISO2700X = {"
  echo "$DONNEES_REFERENTIEL" | jq -r '.[] | "  \u0027" + .iso + "\u0027: { description: " + (.description | @json) + " },"'
  echo "} as const satisfies Record<string, DonneesReferentielsMesuresISO2700X>;"
  echo ""
  echo "export type IdMesureISO2700X = keyof typeof mesuresISO2700X;"
} > "$FICHIER_REFERENTIEL_ISO"

# Table de correspondance IdMesureReCyf -> IdMesureISO2700X[]
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceISOEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import type { IdMesureReCyf } from './donneesReferentielMesuresReCyf.js';"
  echo "import type { IdMesureISO2700X } from './donneesReferentielMesuresISO2700X.js';"
  echo ""
  echo "export const correspondanceMesuresReCyfVersISO2700X: Partial<Record<"
  echo "  IdMesureReCyf,"
  echo "  IdMesureISO2700X[]"
  echo ">> = {"
  echo "$DONNEES_MAPPING" | jq -r '.[] | "  \u0027" + .recyf + "\u0027: [" + (.iso | map("\u0027" + . + "\u0027") | join(", ")) + "],"'
  echo "};"
} > "$FICHIER_CORRESPONDANCE"

# Mise au format du projet (prettier), pour des fichiers directement commitables.
npx --no-install prettier --write "$FICHIER_REFERENTIEL_ISO" "$FICHIER_CORRESPONDANCE" >/dev/null

echo "Généré :" >&2
echo "  - $FICHIER_REFERENTIEL_ISO ($(echo "$DONNEES_REFERENTIEL" | jq 'length') mesures ISO2700x)" >&2
echo "  - $FICHIER_CORRESPONDANCE ($(echo "$DONNEES_MAPPING" | jq 'length') mesures ReCyf)" >&2
