#! /bin/sh

# Ce script configure Vault pour que MSS puisse chiffrer/déchiffrer via l'API Vault
# avec un token et une clé de chiffrement statique
vault server -dev &
SERVER_PID=$!


export VAULT_ADDR=http://mss-crypto:8200

sleep 3

vault login root

vault secrets enable transit

# Cette clé AES256 est hardcodé pour la conserver entre les reboots du conteneur Docker Vault
# Elle n'est utilisée qu'en DEV LOCAL
vault transit import transit/keys/cle-mss '3MYMjS/qJzQ8M7mMgoQcxof+StJbGQl8Pbp7VdUyu1Y=' type=aes256-gcm96

vault policy write app-mss -<<EOF
path "transit/encrypt/cle-mss" {
   capabilities = [ "update" ]
}
path "transit/decrypt/cle-mss" {
   capabilities = [ "update" ]
}
EOF

vault write auth/token/create policies=app-mss id='vault-token-mss-local'

wait $SERVER_PID
