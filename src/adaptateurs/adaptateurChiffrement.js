const { createHash } = require('crypto');
const bcrypt = require('bcrypt');

const chiffre = (chaine) => chaine;

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
  compareBCrypt: compare,
  hacheBCrypt,
  hacheSha256,
  nonce,
};
