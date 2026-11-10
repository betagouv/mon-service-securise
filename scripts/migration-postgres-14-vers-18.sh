#!/usr/bin/env bash
set -euo pipefail

# Copie les données de la base locale PostgreSQL 14 (ancien volume `dbvol`)
# vers le conteneur PostgreSQL 18 (`mss-db`, volume `dbvol-pg18`).
# L'ancien volume n'est pas modifié.

cd "$(git rev-parse --show-toplevel 2>/dev/null || dirname "$0")/"

CONTENEUR_TEMPORAIRE="mss-db-pg14-migration"
RESEAU="mss-network"

CONTENEUR_PG18="$(docker compose ps -q mss-db)"
if [[ -z "$CONTENEUR_PG18" ]]; then
  echo "Le service mss-db (PostgreSQL 18) doit être démarré : docker compose up -d mss-db" >&2
  exit 1
fi

PROJET="$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project" }}' "$CONTENEUR_PG18")"
ANCIEN_VOLUME="${PROJET}_dbvol"

if ! docker volume inspect "$ANCIEN_VOLUME" >/dev/null 2>&1; then
  echo "Aucun ancien volume « $ANCIEN_VOLUME » : rien à migrer." >&2
  exit 1
fi

until docker exec "$CONTENEUR_PG18" pg_isready -U postgres -q; do sleep 1; done

BASE_MSS_EXISTANTE="$(docker exec "$CONTENEUR_PG18" psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'mss'")"
if [[ "$BASE_MSS_EXISTANTE" == "1" ]]; then
  echo "La base « mss » existe déjà dans PostgreSQL 18 : migration annulée pour ne rien écraser." >&2
  exit 1
fi

supprime_conteneur_temporaire() {
  docker rm -f "$CONTENEUR_TEMPORAIRE" >/dev/null 2>&1 || true
}
trap supprime_conteneur_temporaire EXIT

echo "Démarrage d'un PostgreSQL 14 temporaire sur « $ANCIEN_VOLUME »…"
docker run -d --name "$CONTENEUR_TEMPORAIRE" \
  --network "$RESEAU" \
  -v "$ANCIEN_VOLUME":/var/lib/postgresql/data \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  docker.io/postgres:14 >/dev/null

until docker exec "$CONTENEUR_TEMPORAIRE" pg_isready -U postgres -q; do sleep 1; done

# Le dump est fait avec le pg_dumpall de PostgreSQL 18 (recommandé pour une montée de version).
# Le rôle `postgres` existe déjà dans la nouvelle instance : on retire sa création du dump.
echo "Copie des données vers PostgreSQL 18…"
docker exec "$CONTENEUR_PG18" pg_dumpall -h "$CONTENEUR_TEMPORAIRE" -U postgres \
  | grep -v '^CREATE ROLE postgres;$' \
  | docker exec -i "$CONTENEUR_PG18" psql -U postgres -q -v ON_ERROR_STOP=1 >/dev/null

echo "Migration terminée. Une fois vérifié, l'ancien volume peut être supprimé : docker volume rm $ANCIEN_VOLUME"
