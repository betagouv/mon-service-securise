#! /bin/sh

if [ -z "$BALEEN_TOKEN" ] || [ -z "$BALEEN_NAMESPACE" ]
then
    echo -e "\x1b[31m❌ Le Token et le Namespace Baleen sont nécessaires pour l'invalidation du cache\x1b[0m"
    exit 1
fi

NAMESPACE_ID=$(curl https://console.baleen.cloud/api/account -s -H "X-Api-Key: $BALEEN_TOKEN" | jq '.namespaces | to_entries | .[] | select(.value == "'$BALEEN_NAMESPACE'") .key')

curl -X POST https://console.baleen.cloud/api/cache/invalidations \
  -H "X-Api-Key: $BALEEN_TOKEN" \
  -H 'Content-Type: application/json' \
  --cookie "baleen-namespace=$NAMESPACE_ID" \
  --data-raw '{"patterns": ["."]}'

echo -e "\x1b[92m✅ Le cache a été invalidé\x1b[0m"