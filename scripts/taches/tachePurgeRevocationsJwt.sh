#! /bin/bash -l

# Ce script est lancé par le crontab dédié à Clever Cloud.
# Il permet à psql d'avoir accès aux variables d'env
# https://developers.clever-cloud.com/doc/administrate/cron/#access-environment-variables

source "$(dirname "$0")/gardeCron.sh"

psql "$URL_SERVEUR_BASE_DONNEES" -c "DELETE FROM revocations_jwt WHERE date_expiration < NOW();"
