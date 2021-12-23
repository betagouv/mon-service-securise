import ElementsAjoutables from '../modules/elementsAjoutables.js';

$(() => {
  ElementsAjoutables.nouveaux(
    { nom: 'fonctionnalite' },
    '#fonctionnalites-specifiques',
    '#donnees-fonctionnalites-specifiques',
    '#nouvelle-fonctionnalite'
  );

  ElementsAjoutables.nouveaux(
    { nom: 'point-acces', valeurExemple: 'exemple : https://www.adresse.fr, App Store, Play Store…' },
    '#points-acces',
    '#donnees-points-acces',
    '#nouveau-point-acces'
  );
});
