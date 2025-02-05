const { randomBytes, createCipheriv, createDecipheriv } = require('crypto');
const {
  compareBCrypt,
  hacheBCrypt,
  hacheSha256,
  nonce,
} = require('./adaptateurChiffrement');

const decoupeLaChaineChiffree = (chaineChiffree) => ({
  chaineDonneesChiffrees: chaineChiffree.slice(56, -32),
  chaineIV: chaineChiffree.slice(0, 24),
  chaineDonneesAdditionnelles: chaineChiffree.slice(24, 56),
  chaineTag: chaineChiffree.slice(-32),
});

const adaptateurChiffrementChaCha20 = ({ adaptateurEnvironnement }) => {
  const clefSecrete = Buffer.from(
    adaptateurEnvironnement.chiffrement().cleChaCha20Hex(),
    'hex'
  );
  return {
    chiffre: async (chaineOuObjet) => {
      const iv = randomBytes(12);
      const donneesAdditionnelles = randomBytes(16);
      const brut = JSON.stringify(chaineOuObjet);
      const chiffrement = createCipheriv('chacha20-poly1305', clefSecrete, iv, {
        authTagLength: 16,
      });
      chiffrement.setAAD(donneesAdditionnelles, {
        plaintextLength: Buffer.byteLength(brut),
      });

      const donneesChiffrees = Buffer.concat([
        chiffrement.update(brut, 'utf-8'),
        chiffrement.final(),
      ]);
      const tag = chiffrement.getAuthTag();

      return Buffer.concat([
        iv,
        donneesAdditionnelles,
        donneesChiffrees,
        tag,
      ]).toString('hex');
    },
    dechiffre: async (chaineChiffree) => {
      const {
        chaineDonneesChiffrees,
        chaineIV,
        chaineDonneesAdditionnelles,
        chaineTag,
      } = decoupeLaChaineChiffree(chaineChiffree);
      const iv = Buffer.from(chaineIV, 'hex');
      const donneesChiffrees = Buffer.from(chaineDonneesChiffrees, 'hex');
      const tag = Buffer.from(chaineTag, 'hex');

      const dechiffrement = createDecipheriv(
        'chacha20-poly1305',
        clefSecrete,
        iv,
        { authTagLength: 16 }
      );
      dechiffrement.setAAD(Buffer.from(chaineDonneesAdditionnelles, 'hex'), {
        plaintextLength: chaineDonneesChiffrees.length,
      });
      dechiffrement.setAuthTag(Buffer.from(tag));

      const donneesDechiffrees = dechiffrement.update(donneesChiffrees);
      const chaineDechiffree = Buffer.concat([
        donneesDechiffrees,
        dechiffrement.final(),
      ]).toString();
      return JSON.parse(chaineDechiffree);
    },
    compareBCrypt,
    hacheBCrypt,
    hacheSha256,
    nonce,
  };
};

module.exports = {
  adaptateurChiffrementChaCha20,
};
