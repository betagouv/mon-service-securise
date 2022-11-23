const { decode } = require('html-entities');

const decodeCaracteresHtml = (texte) => decode(texte);

const miseEnForme = (operation) => {
  const metEnForme = (objet) => {
    if (typeof objet === 'string') {
      return operation(objet);
    }

    if (Array.isArray(objet)) {
      return objet.map((element) => metEnForme(element));
    }

    if (typeof objet === 'object' && objet) {
      return Object.keys(objet).reduce((accumulateur, propriete) => (
        { ...accumulateur, [propriete]: metEnForme(objet[propriete]) }
      ), {});
    }

    return objet;
  };

  return metEnForme;
};

const miseEnFormeLatex = miseEnForme(decodeCaracteresHtml);

module.exports = {
  miseEnForme,
  miseEnFormeLatex,
};
