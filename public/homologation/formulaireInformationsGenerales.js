import brancheElementsAjoutables from '../modules/brancheElementsAjoutables.js';

const sourceRegExpParamsItem = (nomIndicatif) => `^(description)-${nomIndicatif}-`;

const listesAvecItemsExtraits = [
  { cle: 'pointsAcces', nomIndicatif: 'point-acces' },
  { cle: 'fonctionnalitesSpecifiques', nomIndicatif: 'fonctionnalite' },
  { cle: 'donneesSensiblesSpecifiques', nomIndicatif: 'donnees-sensibles' },
].map((valeur) => (
  { ...valeur, sourceRegExpParamsItem: sourceRegExpParamsItem(valeur.nomIndicatif) }
));

$(() => {
  brancheElementsAjoutables('donnees-sensibles-specifiques', 'donnees-sensibles');
  brancheElementsAjoutables('fonctionnalites-specifiques', 'fonctionnalite');
  brancheElementsAjoutables('points-acces', 'point-acces', 'exemple : https://www.adresse.fr, App Store, Play Store…');
});

export default listesAvecItemsExtraits;
