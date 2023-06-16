const fauxAdaptateurChiffrement = () => ({
  hacheBCrypt: (chaine) => Promise.resolve(`${chaine}-chiffré`),
  compareBCrypt: (enClair, chiffreeReference) =>
    fauxAdaptateurChiffrement()
      .hacheBCrypt(enClair)
      .then((chaineChiffree) => chaineChiffree === chiffreeReference),
});

module.exports = fauxAdaptateurChiffrement;
