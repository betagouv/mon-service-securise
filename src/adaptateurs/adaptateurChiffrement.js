const axios = require('axios');
const { createHash } = require('crypto');
const bcrypt = require('bcrypt');
const { chiffrement } = require('./adaptateurEnvironnement');

const chiffre = async (chaine) => {
  const env = chiffrement();
  const base = env.urlBaseDuService();
  const cleTransit = env.cleDuMoteurTransit();

  const reponse = await axios.put(
    `${base}/v1/transit/encrypt/${cleTransit}`,
    { plaintext: chaine },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Vault-Token': env.tokenVault(),
      },
    }
  );

  return reponse.data.data.ciphertext;
};

const dechiffre = async (chaine) => {
  const env = chiffrement();
  const base = env.urlBaseDuService();
  const cleTransit = env.cleDuMoteurTransit();

  const reponse = await axios.put(
    `${base}/v1/transit/decrypt/${cleTransit}`,
    { ciphertext: chaine },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Vault-Token': env.tokenVault(),
      },
    }
  );

  return reponse.data.data.plaintext;
};

const NOMBRE_DE_PASSES = 10;
const hacheBCrypt = (chaineEnClair) =>
  bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

const { compare } = bcrypt;

const hacheSha256 = (chaine) =>
  createHash('sha256').update(chaine).digest('hex');

const nonce = () =>
  hacheBCrypt(`${Math.random()}`).then((s) => s.replace(/[/$.]/g, ''));

module.exports = {
  chiffre,
  dechiffre,
  compareBCrypt: compare,
  hacheBCrypt,
  hacheSha256,
  nonce,
};
