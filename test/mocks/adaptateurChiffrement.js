const fauxAdaptateurChiffrement = {
  chiffre: (chaine) => Promise.resolve(`${chaine}-chiffré`),
  compare: (enClair, chiffreeReference) =>
    fauxAdaptateurChiffrement
      .chiffre(enClair)
      .then((chaineChiffree) => chaineChiffree === chiffreeReference),
};

module.exports = fauxAdaptateurChiffrement;
