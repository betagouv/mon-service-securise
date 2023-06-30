const fauxAdaptateurChiffrement = () => ({
  chiffre: (chaine) => chaine,
  dechiffre: (chaine) => chaine,
  hacheBCrypt: (chaine) => Promise.resolve(`${chaine}-haché`),
  compareBCrypt: (enClair, chiffreeReference) =>
    fauxAdaptateurChiffrement()
      .hacheBCrypt(enClair)
      .then((chaineChiffree) => chaineChiffree === chiffreeReference),
});

module.exports = fauxAdaptateurChiffrement;
