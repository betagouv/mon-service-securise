import brancheElementsAjoutables from '../modules/elementsAjoutables.js';

const sourceRegExpParamsItem = (nomIndicatif) => `^(description)-${nomIndicatif}-`;

const listesAvecItemsExtraits = [
  { cle: 'pointsAcces', nomIndicatif: 'point-acces' },
  { cle: 'fonctionnalitesSpecifiques', nomIndicatif: 'fonctionnalite' },
].map((valeur) => (
  { ...valeur, sourceRegExpParamsItem: sourceRegExpParamsItem(valeur.nomIndicatif) }
));

$(() => {
  brancheElementsAjoutables('fonctionnalites-specifiques', 'fonctionnalite');
  brancheElementsAjoutables('points-acces', 'point-acces', 'exemple : https://www.adresse.fr, App Store, Play Store…');
});

export default listesAvecItemsExtraits;
