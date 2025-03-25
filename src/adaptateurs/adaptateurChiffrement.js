const { createHash, randomBytes } = require('crypto');
const bcrypt = require('bcrypt');

const adaptateurChiffrement = ({ adaptateurEnvironnement }) => {
  const NOMBRE_DE_PASSES = 10;

  const hacheBCrypt = (chaineEnClair) =>
    bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

  const hacheSha256AvecUnSeulSel = (chaine, sel) =>
    createHash('sha256')
      .update(chaine + sel)
      .digest('hex');

  return {
    chiffre: async (chaineOuObjet) => chaineOuObjet,

    dechiffre: async (chaineChiffree) => chaineChiffree,

    hacheBCrypt,

    compareBCrypt: bcrypt.compare,

    hacheSha256AvecUnSeulSel,

    hacheSha256: (chaineEnClair) => {
      const tousLesSelsDeHachage = adaptateurEnvironnement
        .chiffrement()
        .tousLesSelsDeHachage();

      const hashFinal = tousLesSelsDeHachage.reduce(
        (acc, { sel }) => hacheSha256AvecUnSeulSel(acc, sel),
        chaineEnClair
      );

      const version = tousLesSelsDeHachage
        .map(({ version: numVersion }) => `v${numVersion}`)
        .join('-');

      return `${version}:${hashFinal}`;
    },

    nonce: () => randomBytes(16).toString('base64'),
  };
};

module.exports = {
  adaptateurChiffrement,
};
