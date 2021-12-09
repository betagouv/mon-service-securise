import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';

$(() => {
  const zoneSaisie = (nom, descriptif = '') => (index, { description = '' }) => `
    <input
      id="description-${nom}-${index}"
      name="description-${nom}-${index}"
      type="text"
      value="${description}"
      placeholder="${descriptif}"
    >
  `;

  const brancheAjoutElements = (zoneSaisieElement) => (...params) => (element) => brancheAjoutItem(
    ...params,
    (index) => zoneSaisieElement(index, {}),
    () => (element.indexMax += 1)
  );

  const peupleElements = (zoneSaisieElement) => (...params) => (
    peupleListeItems(...params, zoneSaisieElement)
  );

  const zoneSaisiePointAcces = zoneSaisie('point-acces', 'exemple : https://www.adresse.fr, App Store, Play Store, …');
  const pointsAcces = {
    indexMax: 0,
  };
  const brancheAjoutPointAcces = brancheAjoutElements(zoneSaisiePointAcces);
  const peuplePointsAcces = peupleElements(zoneSaisiePointAcces);

  const zoneSaisieFonctionnalite = zoneSaisie('fonctionnalite');
  const fonctionnalitesSupplementaires = {
    indexMax: 0,
  };
  const brancheAjoutFonctionnalite = brancheAjoutElements(zoneSaisieFonctionnalite);
  const peupleFonctionnalite = peupleElements(zoneSaisieFonctionnalite);

  pointsAcces.indexMax = peuplePointsAcces('#points-acces', '#donneesPointsAcces');
  brancheAjoutPointAcces('.nouveau-point-acces', '#points-acces')(pointsAcces);

  fonctionnalitesSupplementaires.indexMax = peupleFonctionnalite('#fonctionnalites-supplementaires', '#donnees-fonctionnalites-suppementaires');
  brancheAjoutFonctionnalite('.nouvelle-fonctionnalite', '#fonctionnalites-supplementaires')(fonctionnalitesSupplementaires);
});
