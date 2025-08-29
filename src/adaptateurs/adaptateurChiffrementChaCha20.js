import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { adaptateurChiffrement } from './adaptateurChiffrement.js';

const adaptateurChiffrementChaCha20 = ({ adaptateurEnvironnement }) => {
  const adaptateurChiffrementDeBase = adaptateurChiffrement({
    adaptateurEnvironnement,
  });

  const clefSecrete = Buffer.from(
    adaptateurEnvironnement.chiffrement().cleChaCha20Hex(),
    'hex'
  );
  return {
    chiffre: async (chaineOuObjet) => {
      const iv = randomBytes(12);
      const aad = randomBytes(16);
      const donneesAChiffrer = JSON.stringify(chaineOuObjet);

      const chiffreur = createCipheriv('chacha20-poly1305', clefSecrete, iv, {
        authTagLength: 16,
      });
      chiffreur.setAAD(aad, {
        plaintextLength: Buffer.byteLength(donneesAChiffrer),
      });

      const donneesChiffrees = Buffer.concat([
        chiffreur.update(donneesAChiffrer, 'utf-8'),
        chiffreur.final(),
      ]);
      const tag = chiffreur.getAuthTag();

      return {
        iv: iv.toString('hex'),
        aad: aad.toString('hex'),
        donnees: donneesChiffrees.toString('hex'),
        tag: tag.toString('hex'),
      };
    },
    dechiffre: async (donneesChiffrees) => {
      const { iv, aad, donnees, tag } = donneesChiffrees;

      const dechiffreur = createDecipheriv(
        'chacha20-poly1305',
        clefSecrete,
        Buffer.from(iv, 'hex'),
        { authTagLength: 16 }
      );
      dechiffreur.setAAD(Buffer.from(aad, 'hex'), {
        plaintextLength: donnees.length,
      });
      dechiffreur.setAuthTag(Buffer.from(tag, 'hex'));

      const chaineDechiffree = Buffer.concat([
        dechiffreur.update(Buffer.from(donnees, 'hex')),
        dechiffreur.final(),
      ]);
      return JSON.parse(chaineDechiffree);
    },
    compareBCrypt: adaptateurChiffrementDeBase.compareBCrypt,
    hacheBCrypt: adaptateurChiffrementDeBase.hacheBCrypt,
    hacheSha256: adaptateurChiffrementDeBase.hacheSha256,
    nonce: adaptateurChiffrementDeBase.nonce,
  };
};

export { adaptateurChiffrementChaCha20 };
