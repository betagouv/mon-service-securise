const sourceRegExpParamsItem = (nomIndicatif) => `^(description)-${nomIndicatif}-`;

const listesAvecItemsExtraits = [
  { cle: 'pointsAcces', nomIndicatif: 'point-acces' },
  { cle: 'fonctionnalitesSpecifiques', nomIndicatif: 'fonctionnalite' },
  { cle: 'donneesSensiblesSpecifiques', nomIndicatif: 'donnees-sensibles' },
].map((valeur) => (
  { ...valeur, sourceRegExpParamsItem: sourceRegExpParamsItem(valeur.nomIndicatif) }
));

export default listesAvecItemsExtraits;
