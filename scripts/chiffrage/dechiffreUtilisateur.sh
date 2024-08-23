data=$(psql -h localhost -U postgres mss -c "SELECT donnees from utilisateurs where id='$1'" -A -t)

data=`echo $data | cut -d "\"" -f 2`

export VAULT_ADDR='http://0.0.0.0:8200'
vault login root

# entrer le mot de passe 'root'
vault write -field="plaintext" transit/decrypt/cle-mss ciphertext=$data | base64 --decode | jq .
