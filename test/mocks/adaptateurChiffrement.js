const fauxAdaptateurChiffrement = () => ({
  chiffre: async (chaine) => chaine,
  dechiffre: async (chaine) => chaine,
  hacheBCrypt: (chaine) => Promise.resolve(chaine ? `${chaine}-haché` : chaine),
  hacheSha256: (chaine) => `${chaine}-haché256`,
  compareBCrypt: (enClair, chiffreeReference) =>
    fauxAdaptateurChiffrement()
      .hacheBCrypt(enClair)
      .then((chaineChiffree) => chaineChiffree === chiffreeReference),
});

module.exports = fauxAdaptateurChiffrement;
