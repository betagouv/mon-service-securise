const { createHash } = require('crypto');
const bcrypt = require('bcrypt');

const adaptateurChiffrement = () => {
  const NOMBRE_DE_PASSES = 10;
  const hacheBCrypt = (chaineEnClair) =>
    bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

  return {
    chiffre: async (chaineOuObjet) => chaineOuObjet,

    dechiffre: async (chaineChiffree) => chaineChiffree,

    hacheBCrypt,

    compareBCrypt: bcrypt.compare,

    hacheSha256: (chaine) =>
      `v1:${createHash('sha256').update(chaine).digest('hex')}`,

    nonce: () =>
      hacheBCrypt(`${Math.random()}`).then((s) => s.replace(/[/$.]/g, '')),
  };
};

module.exports = {
  adaptateurChiffrement,
};
