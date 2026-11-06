#! /bin/bash -l

# Ce script est lancé par le crontab dédié à Clever Cloud.
# Il permet au process node d'avoir accès aux variables d'env
# https://developers.clever-cloud.com/doc/administrate/cron/#access-environment-variables

source "$(dirname "$0")/gardeCron.sh"

cd "${APP_HOME}" || exit
node --import tsx scripts/taches/tacheEnvoiRapportHebdomadaire.ts
