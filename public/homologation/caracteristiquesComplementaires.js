import brancheAjoutItem from '../modules/saisieListeItems.js';
import { parametresAvecItemsExtraits } from '../modules/parametres.js';

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

  const afficheZoneSaisieEntiteExterne = (selecteur, index, donneesEntiteExterne) => {
    const $conteneurSaisieEntitesExternes = $(`
<label class="item-ajoute">
  <div class="icone-suppression"/>
</label>
    `);

    $(selecteur).append($conteneurSaisieEntitesExternes);
    $('.icone-suppression').click((e) => {
      e.preventDefault();
      $(e.target).parent().remove();
    });

    const zoneSaisie = zoneSaisieEntiteExterne(index, donneesEntiteExterne);
    $conteneurSaisieEntitesExternes.append(zoneSaisie);
  };

  const peupleEntitesExternes = (selecteurConteneur, selecteurDonnees) => {
    const donneesEntitesExternes = JSON.parse($(selecteurDonnees).text());
    donneesEntitesExternes.forEach(
      (donnees, index) => afficheZoneSaisieEntiteExterne(selecteurConteneur, index, donnees)
    );

    if (donneesEntitesExternes.length === 0) {
      const indexMin = 0;
      afficheZoneSaisieEntiteExterne(selecteurConteneur, indexMin);
    }

    return Math.max(0, donneesEntitesExternes.length - 1);
  };

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
