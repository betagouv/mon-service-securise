#!/usr/bin/env bash

# Les règles de sélection des VECTEURS sont dans un Grist.
# Notre code attend un objet Typescript pour alimenter `SelectionVecteurs()`.
# Ce script transforme le CSV du Grist en JSON à placer dans le code source de MSS.

# Miller : https://miller.readthedocs.io/en/6.15.0/

# Utilisation : `./transformeCSVPourSelectionVecteurs.sh <chemin vers .csv>`


FICHIER_CSV="$1"

FICHIER_TYPESCRIPT="$(dirname "$0")/../../src/moteurRisques/v2/selectionVecteurs.configuration.ts"

{
  echo "import type { ConfigurationSelectionVecteurs } from './selectionVecteurs.types.js';"
  echo ""
  echo "export const configurationSelectionVecteurs: ConfigurationSelectionVecteurs ="

  mlr --icsv --ojson cat "$FICHIER_CSV" | jq '

  def regle_optionnelle($cleRegle; $mapping):
    . as $root
    | ($mapping
        | with_entries(.value = $root[.value])
        | with_entries(select(.value != ""))
      ) as $resultat
    | (
        if ($resultat | length) == 0
        then .
        else . + { ($cleRegle): $resultat }
        end
      )
    | reduce ($mapping | to_entries[] | .value) as $f (.; del(.[$f]));

  map(
    .presentInitialement = (.["Statut de base :"] == "Présent")
    | del(.["Statut de base :"])

    ################
    # Pour chaque vecteur, on construit les regles, composées de modificateurs.
    # Puis on les placera sous `regles`.
    # Chaque règle garde seulement les modificateurs qui ont une valeur dans le CSV.

    | regle_optionnelle(
        "niveauSecurite";
        {
          niveau1: "Effet : Basique",
          niveau2: "Effet : Modéré"
        }
      )

    | regle_optionnelle(
        "activitesExternalisees";
        {
          administrationTechnique: "Effet : Admin tech externalisé",
          developpementLogiciel: "Effet : Développement externalisé"
        }
      )

    | regle_optionnelle(
        "dureeDysfonctionnementAcceptable";
        {
          moinsDe4h: "Effet : Dispo ++++",
          moinsDe12h: "Effet : Dispo +++",
        }
      )

    | regle_optionnelle(
        "ouvertureSysteme";
        {
          internePlusTiers: "Effet : Ouv +++",
          accessibleSurInternet: "Effet : Ouv ++++"
        }
      )

    | regle_optionnelle(
        "specificitesProjet";
        {
          postesDeTravail: "Effet : Postes de travail",
          accesPhysiqueAuxSallesTechniques: "Effet : Accès physiques"
        }
      )

    | regle_optionnelle(
        "typeHebergement";
        {
          cloud: "Effet : IaaS / PaaS",
          saas: "Effet : SaaS"
        }
      )

    | del(
        .["Effet : Site vitrine"],
        .["Effet : Service en ligne"],
        .["Effet : Annuaire"],
        .["Effet : API"],
        .["Effet : Application mobile"],
        .["Effet : Echange ou réception de mails"],
        .["Effet : Isolé"],
        .["Effet : Ouv +"],
        .["Effet : Ouv ++"],
        .["Effet : Hors UE"],
        .["Commentaire"],
        .["Vecteur"]
      )

    | {(.Ref): (del(.Ref))}
  )

  | add

  # Crée le niveau `regles` dans chaque vecteur
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