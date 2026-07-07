#!/usr/bin/env bash

# Deux CSV alimentent ce script :
#   - le référentiel ReCyF (ReCyf.csv) : une ligne par mesure ReCyF ;
#   - la correspondance MSS <-> ReCyF (ReCyF_MSS.csv) : les mesures MSS associées
#     à chaque mesure ReCyF.
#
# Il en tire deux fichiers source Typescript :
#   - donneesReferentielMesuresReCyf.ts : l'objet `mesuresReCyf` (identifiant
#     ReCyF -> { objectif, thematique, description, entitesConcernees }) déclaré
#     `as const satisfies Record<string, DonneesReferentielsMesuresReCyf>`. Le
#     `as const` (et non une annotation de type) est indispensable pour que
#     `keyof typeof mesuresReCyf` reste l'union littérale des identifiants ; le
#     `satisfies` valide la forme de chaque entrée sans élargir ce type.
#   - correspondanceMesuresV2VersReCyf.ts : la table IdMesureV2 (MSS) ->
#     IdMesureReCyf[]. C'est Typescript qui vérifie, à la compilation, que chaque
#     identifiant ReCyF de la table existe bien dans le référentiel.
#
# La relation est « 1 ReCyF pour N mesures MSS » : une même mesure MSS peut donc
# apparaître pour plusieurs mesures ReCyF, d'où la valeur en tableau.
#
# Miller : https://miller.readthedocs.io/en/6.15.0/
#
# Utilisation :
#   ./transformeCorrespondanceReCyfEnTypescript.sh <ReCyf.csv> <ReCyF_MSS.csv>

FICHIER_REFERENTIEL_CSV="${1:-}"
FICHIER_MAPPING_CSV="${2:-}"

if [ -z "$FICHIER_REFERENTIEL_CSV" ] || [ -z "$FICHIER_MAPPING_CSV" ]; then
  echo "Usage : $0 <ReCyf.csv (référentiel)> <ReCyF_MSS.csv (correspondance)>"
  exit 1
fi

RACINE="$(dirname "$0")/../.."
FICHIER_REFERENTIEL_RECYF="$RACINE/src/mesures/referentielsExternes/donneesReferentielMesuresReCyf.ts"
FICHIER_CORRESPONDANCE="$RACINE/src/mesures/referentielsExternes/correspondanceMesuresV2VersReCyf.ts"

# Tri naturel d'un identifiant pointé : "2.C.1" avant "10.A.1",
CLE_TRI='def cleTri: [ splits("[.]") ] | map(if test("^[0-9]+$") then tonumber else . end);'

# Référentiel ReCyF : une entrée par mesure, triée par numérotation.
DONNEES_REFERENTIEL="$(
  mlr --icsv --ojson cut -f 'Références (New),Objectif de sécurité,Thématique,Contenu,EIEE' "$FICHIER_REFERENTIEL_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["Références (New)"] != null and .["Références (New)"] != ""))
      | map({
          recyf: .["Références (New)"],
          objectif: ((.["Objectif de sécurité"] // "") | gsub("^\\s+|\\s+$"; "")),
          thematique: ((.["Thématique"] // "") | gsub("^\\s+|\\s+$"; "")),
          description: ((.["Contenu"] // "") | gsub("^\\s+|\\s+$"; "")),
          entitesConcernees: (
            (.["EIEE"] // "")
            | split(",")
            | map(gsub("^\\s+|\\s+$"; ""))
            | map(select(length > 0))
          )
        })
      | group_by(.recyf) | map(.[0])
      | sort_by(.recyf | cleTri)
    '
)"

# Correspondance MSS -> ReCyF[] : on éclate chaque ligne en paires (mss, recyf),
# puis on regroupe par mesure MSS.
DONNEES_MAPPING="$(
  mlr --icsv --ojson cut -f 'ID ReCyF,Références MSS' "$FICHIER_MAPPING_CSV" \
    | jq "$CLE_TRI"'
      map(select(.["ID ReCyF"] != null and .["ID ReCyF"] != ""))
      | map({
          recyf: .["ID ReCyF"],
          mss: (
            (.["Références MSS"] // "")
            | split(",")
            | map(gsub("^\\s+|\\s+$"; ""))
            | map(select(length > 0))
          )
        })
      | map(. as $l | $l.mss[] | { mss: ., recyf: $l.recyf })
      | group_by(.mss)
      | map({ mss: .[0].mss, recyf: (map(.recyf) | unique | sort_by(cleTri)) })
      | sort_by(.mss | cleTri)
    '
)"

# Référentiel ReCyF
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceReCyfEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import { DonneesReferentielsMesuresReCyf } from '../../referentielV2.js';"
  echo ""
  echo "export const mesuresReCyf = {"
  echo "$DONNEES_REFERENTIEL" | jq -r '.[] | "  \u0027" + .recyf + "\u0027: { objectif: " + (.objectif | @json) + ", thematique: " + (.thematique | @json) + ", description: " + (.description | @json) + ", entitesConcernees: [" + (.entitesConcernees | map(@json) | join(", ")) + "] },"'
  echo "} as const satisfies Record<string, DonneesReferentielsMesuresReCyf>;"
  echo ""
  echo "export type IdMesureReCyf = keyof typeof mesuresReCyf;"
} > "$FICHIER_REFERENTIEL_RECYF"

# Table de correspondance IdMesureV2 (MSS) -> IdMesureReCyf[]
{
  echo "/*"
  echo "  Fichier généré par scripts/referentielsMesuresExternes/transformeCorrespondanceReCyfEnTypescript.sh"
  echo "  Ne pas modifier directement"
  echo "*/"
  echo ""
  echo "import type { IdMesureReCyf } from './donneesReferentielMesuresReCyf.js';"
  echo "import type { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';"
  echo ""
  echo "export const correspondanceMesuresV2VersReCyf: Partial<Record<"
  echo "  IdMesureV2,"
  echo "  IdMesureReCyf[]"
  echo ">> = {"
  echo "$DONNEES_MAPPING" | jq -r '.[] | "  \u0027" + .mss + "\u0027: [" + (.recyf | map("\u0027" + . + "\u0027") | join(", ")) + "],"'
  echo "};"
} > "$FICHIER_CORRESPONDANCE"

# Mise au format du projet (prettier), pour des fichiers directement commitables.
npx --no-install prettier --write "$FICHIER_REFERENTIEL_RECYF" "$FICHIER_CORRESPONDANCE" >/dev/null

echo "Généré :" >&2
echo "  - $FICHIER_REFERENTIEL_RECYF ($(echo "$DONNEES_REFERENTIEL" | jq 'length') mesures ReCyF)" >&2
echo "  - $FICHIER_CORRESPONDANCE ($(echo "$DONNEES_MAPPING" | jq 'length') mesures MSS)" >&2
