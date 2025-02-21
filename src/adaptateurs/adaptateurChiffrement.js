const { createHash } = require('crypto');
const bcrypt = require('bcrypt');

const adaptateurChiffrement = ({ adaptateurEnvironnement }) => {
  const NOMBRE_DE_PASSES = 10;
  const hacheBCrypt = (chaineEnClair) =>
    bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

  return {
    chiffre: async (chaineOuObjet) => chaineOuObjet,

    dechiffre: async (chaineChiffree) => chaineChiffree,

    hacheBCrypt,

    compareBCrypt: bcrypt.compare,

    hacheSha256: (chaineEnClair) => {
      const hacheSha256AvecSel = (chaine, sel) =>
        createHash('sha256')
          .update(chaine + sel)
          .digest('hex');

      const tousLesSelsDeHachage = adaptateurEnvironnement
        .chiffrement()
        .tousLesSelsDeHachage();

      const hashFinal = tousLesSelsDeHachage.reduce(
        (acc, { sel }) => hacheSha256AvecSel(acc, sel),
        chaineEnClair
      );

      const version = tousLesSelsDeHachage
        .map(({ version: numVersion }) => `v${numVersion}`)
        .join('-');

      return `${version}:${hashFinal}`;
    },

    nonce: () =>
      hacheBCrypt(`${Math.random()}`).then((s) => s.replace(/[/$.]/g, '')),
  };
};

module.exports = {
  adaptateurChiffrement,
};
