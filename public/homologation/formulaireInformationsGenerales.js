import ElementsAjoutables from '../modules/elementsAjoutables.js';

$(() => {
  ElementsAjoutables.nouveaux(
    { nom: 'fonctionnalite' },
    '#fonctionnalites-supplementaires',
    '#donnees-fonctionnalites-suppementaires',
    '.nouvelle-fonctionnalite'
  );

  ElementsAjoutables.nouveaux(
    { nom: 'point-acces', valeurExemple: 'exemple : https://www.adresse.fr, App Store, Play Store…' },
    '#points-acces',
    '#donneesPointsAcces',
    '.nouveau-point-acces'
  );
});
