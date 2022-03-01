import { brancheElementsAjoutablesDescription } from '../modules/brancheElementsAjoutables.js';

$(() => {
  brancheElementsAjoutablesDescription('donnees-sensibles-specifiques', 'donnees-sensibles');
  brancheElementsAjoutablesDescription('fonctionnalites-specifiques', 'fonctionnalite');
  brancheElementsAjoutablesDescription('points-acces', 'point-acces', 'exemple : https://www.adresse.fr, App Store, Play Store…');
});
