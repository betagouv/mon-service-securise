const { createHash } = require('crypto');
const bcrypt = require('bcrypt');

const NOMBRE_DE_PASSES = 10;

const chiffre = (chaineEnClair) => bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

const { compare } = bcrypt;

const hacheSha256 = (chaine) =>
  createHash('sha256').update(chaine).digest('hex');

const nonce = () =>
  chiffre(`${Math.random()}`).then((s) => s.replace(/[/$.]/g, ''));

module.exports = { chiffre, compare, hacheSha256, nonce };
