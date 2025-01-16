const { createHash } = require('crypto');
const bcrypt = require('bcrypt');

const chiffre = async (chaineOuObjet) => chaineOuObjet;

const dechiffre = async (chaineChiffree) => chaineChiffree;

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
