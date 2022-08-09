const bcrypt = require('bcrypt');

const NOMBRE_DE_PASSES = 10;

const chiffre = (chaineEnClair) => bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);
const { compare } = bcrypt;
const nonce = () => chiffre(`${Math.random()}`)
  .then((s) => s.replace(/[/$.]/g, ''));

module.exports = { chiffre, compare, nonce };
