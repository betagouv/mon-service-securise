const { decode } = require('html-entities');

const decodeCaracteresHtml = (texte) => decode(texte);
const echappeCaracteresSpeciauxLatex = (texte) => texte.replaceAll('&', '\\&');

const miseEnForme = (...operations) => {
  const opere = (texte) => operations.reduce(
    (accumulateur, operation) => operation(accumulateur), texte
  );

  const metEnForme = (objet) => {
    if (typeof objet === 'string') {
      return opere(objet);
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

const miseEnFormeLatex = miseEnForme(decodeCaracteresHtml, echappeCaracteresSpeciauxLatex);

module.exports = {
  decodeCaracteresHtml,
  echappeCaracteresSpeciauxLatex,
  miseEnForme,
  miseEnFormeLatex,
};
