# Ce fichier est sourcé par les scripts de tâches lancés par le crontab dédié à Clever Cloud.

# On ne veut pas exécuter les CRON depuis une instance spawnée à cause d'un scaling.
# https://developers.clever-cloud.com/doc/administrate/cron/#deduplicating-crons
if [[ "$INSTANCE_NUMBER" != "0" ]]; then
  echo "L'instance n'est pas la 0, c'est la ${INSTANCE_NUMBER}. On s'arrête là."
  exit 0
fi
