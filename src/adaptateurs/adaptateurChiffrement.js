const bcrypt = require('bcrypt');

const chaineChiffree = (chaineEnClair) => bcrypt.hash(chaineEnClair, 10);
const nonce = () => chaineChiffree(`${Math.random()}`)
  .then((s) => s.replace(/[/$.]/g, ''));

module.exports = { nonce };
