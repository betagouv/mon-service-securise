const axios = require('axios');
const { chiffrement } = require('./adaptateurEnvironnement');
const {
  compareBCrypt,
  hacheBCrypt,
  hacheSha256,
  nonce,
} = require('./adaptateurChiffrement');

const chiffre = async (chaineOuObjet) => {
  const env = chiffrement();
  const base = env.urlBaseDuService();
  const cleTransit = env.cleDuMoteurTransit();

  const brut = JSON.stringify(chaineOuObjet);
  const base64 = Buffer.from(brut).toString('base64');

  const reponse = await axios.put(
    `${base}/v1/transit/encrypt/${cleTransit}`,
    { plaintext: base64 },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Vault-Token': env.tokenVault(),
      },
    }
  );
  return JSON.stringify(reponse.data.data.ciphertext);
};

const dechiffre = async (chaineChiffree) => {
  const env = chiffrement();
  const base = env.urlBaseDuService();
  const cleTransit = env.cleDuMoteurTransit();

  const reponse = await axios.put(
    `${base}/v1/transit/decrypt/${cleTransit}`,
    { ciphertext: chaineChiffree },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Vault-Token': env.tokenVault(),
      },
    }
  );

  const base64 = Buffer.from(reponse.data.data.plaintext, 'base64');
  const brut = base64.toString('utf-8');
  return JSON.parse(brut);
};

module.exports = {
  chiffre,
  dechiffre,
  compareBCrypt,
  hacheBCrypt,
  hacheSha256,
  nonce,
};
