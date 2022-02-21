import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';
import { parametresAvecItemsExtraits } from '../modules/parametres.mjs';

$(() => {
  let indexMaxEntitesExternes = 0;

  const zoneSaisieEntiteExterne = (index, donneesEntiteExterne = {}) => {
    const proprietesEntiteExterne = {
      nom: "Nom de l'entité",
      contact: 'Point de contact',
      acces: "Nature de l'accès (facultatif)",
    };

    return Object.keys(proprietesEntiteExterne).reduce((acc, p) => {
      const propriete = `${p}-entite-${index}`;
      const valeur = donneesEntiteExterne[p] || '';
      return `${acc}
<input id="${propriete}"
  name="${propriete}"
  type="text"
  placeholder="${proprietesEntiteExterne[p]}"
  value="${valeur}">
      `;
    }, '');
  };

  const peupleEntitesExternes = (...params) => (
    peupleListeItems(...params, zoneSaisieEntiteExterne)
  );

  const brancheAjoutEntiteExterne = (...params) => brancheAjoutItem(
    ...params,
    (index) => zoneSaisieEntiteExterne(index),
    () => (indexMaxEntitesExternes += 1),
  );

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  indexMaxEntitesExternes = peupleEntitesExternes('#entites-externes', '#donneesEntitesExternes');
  brancheAjoutEntiteExterne('.nouvel-item', '#entites-externes');

  $bouton.click(() => {
    const params = parametresAvecItemsExtraits(
      'form#caracteristiques-complementaires',
      'entitesExternes',
      '^(nom|contact|acces)-entite-',
    );

    axios.post(
      `/api/homologation/${identifiantHomologation}/caracteristiquesComplementaires`,
      params,
    ).then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
