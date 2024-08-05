#! /bin/bash -l

# Ce script est lancé par le crontab dédié à Clever Cloud.
# Il permet au process node d'avoir accès aux variables d'env
# https://developers.clever-cloud.com/doc/administrate/cron/#access-environment-variables

cd "${APP_HOME}" || exit
node scripts/taches/tacheEnvoieMailsNotificationExpiration.js