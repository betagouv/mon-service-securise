const { createHash } = require('crypto');
const bcrypt = require('bcrypt');
const adaptateurEnvironnement = require('./adaptateurEnvironnement');

const chiffre = async (chaineOuObjet) => chaineOuObjet;

const dechiffre = async (chaineChiffree) => chaineChiffree;

const NOMBRE_DE_PASSES = 10;
const hacheBCrypt = (chaineEnClair) =>
  bcrypt.hash(chaineEnClair, NOMBRE_DE_PASSES);

const { compare } = bcrypt;

const hacheSha256AvecSel = (chaine, sel) =>
  createHash('sha256')
    .update(chaine + sel)
    .digest('hex');

const hacheSha256AvecTousLesSels = (chaineEnClair) => {
  const tousLesSelsDeHachage = adaptateurEnvironnement
    .chiffrement()
    .tousLesSelsDeHachage();
  return tousLesSelsDeHachage.reduce(
    (acc, { sel }) => hacheSha256AvecSel(acc, sel),
    chaineEnClair
  );
};

const nonce = () =>
  hacheBCrypt(`${Math.random()}`).then((s) => s.replace(/[/$.]/g, ''));

module.exports = {
  chiffre,
  dechiffre,
  compareBCrypt: compare,
  hacheBCrypt,
  hacheSha256: hacheSha256AvecTousLesSels,
  nonce,
};
