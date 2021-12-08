import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';

$(() => {
  const zoneSaisiePointAcces = (index, { description = '' }) => `
    <input
      id="description-point-acces-${index}"
      name="description-point-acces-${index}"
      type="text"
      value="${description}"
      placeholder="exemple : https://www.adresse.fr, App Store, Play Store, …"
    >
  `;

  let indexMaxPointsAcces = 0;

  const peuplePointsAcces = (...params) => peupleListeItems(...params, zoneSaisiePointAcces);

  const brancheAjoutPointAcces = (...params) => brancheAjoutItem(
    ...params,
    (index) => zoneSaisiePointAcces(index, {}),
    () => (indexMaxPointsAcces += 1),
  );

  indexMaxPointsAcces = peuplePointsAcces('#points-acces', '#donneesPointsAcces');
  brancheAjoutPointAcces('.nouvel-item', '#points-acces');
});
