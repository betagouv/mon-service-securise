const { decode } = require('html-entities');

// Cette liste provient d'ici https://tex.stackexchange.com/a/34586
const caracteresSpeciauxLatex = [
  { special: '\\', latex: '\\textbackslash' },
  { special: '&', latex: '\\&' },
  { special: '%', latex: '\\%' },
  { special: '$', latex: '\\textdollar' },
  { special: '#', latex: '\\#' },
  { special: '_', latex: '\\_' },
  { special: '{', latex: '\\{' },
  { special: '}', latex: '\\}' },
  { special: '~', latex: '\\textasciitilde' },
  { special: '^', latex: '\\textasciicircum' },
  { special: '\r', latex: '\\\\' },
];

const echappeCaracteresSpeciauxLatex = (texte) => caracteresSpeciauxLatex.reduce(
  (accumulateur, caractere) => accumulateur.replaceAll(caractere.special, caractere.latex), texte
);

const decodeCaracteresHtml = (texte) => decode(texte);

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
  miseEnForme,
  miseEnFormeLatex,
};
