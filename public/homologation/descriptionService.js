import { brancheElementsAjoutablesDescription } from '../modules/brancheElementsAjoutables.js';
import extraisParametresDescriptionService from '../modules/parametresDescriptionService.mjs';
import initialiseComportementFormulaire from '../modules/soumetsHomologation.mjs';

$(() => {
  initialiseComportementFormulaire(
    'form#homologation',
    '.bouton#diagnostic',
    { fonctionExtractionParametres: extraisParametresDescriptionService },
  );

  brancheElementsAjoutablesDescription('donnees-sensibles-specifiques', 'donnees-sensibles');
  brancheElementsAjoutablesDescription('fonctionnalites-specifiques', 'fonctionnalite');
  brancheElementsAjoutablesDescription('points-acces', 'point-acces', 'exemple : https://www.adresse.fr, App Store, Play Store…');
});
