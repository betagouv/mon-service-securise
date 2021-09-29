import parametres from '../modules/parametres.js';

$(() => {
  let indexMaxEntitesExternes = 0;

  const afficheZoneSaisieEntiteExterne = (selecteur, index, donneesEntiteExterne = {}) => {
    const $conteneurSaisieEntitesExternes = $(`
<label class="entite-externe">
  <div class="icone-suppression"/>
</label>
`);
    $(selecteur).append($conteneurSaisieEntitesExternes);
    $('.icone-suppression').click((e) => {
      e.preventDefault();
      $(e.target).parent().remove();
    });

    const proprietesEntiteExterne = {
      nom: "Nom de l'entité",
      contact: 'Point de contact',
      acces: "Nature de l'accès (facultatif)",
    };

    Object.keys(proprietesEntiteExterne).forEach((p) => {
      const propriete = `${p}-entite-${index}`;
      const valeur = donneesEntiteExterne[p] || '';
      $conteneurSaisieEntitesExternes.append(`
<input id="${propriete}"
  name="${propriete}"
  type="text"
  placeholder="${proprietesEntiteExterne[p]}"
  value="${valeur}">
      `);
    });
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

  const brancheAjoutEntiteExterne = (selecteurAction, selecteurConteneur) => {
    $(selecteurAction).click((e) => {
      e.preventDefault();
      indexMaxEntitesExternes += 1;
      afficheZoneSaisieEntiteExterne(selecteurConteneur, indexMaxEntitesExternes);
    });
  };

  const extraisEntitesExternes = (params) => {
    const regExpParametresEntitesExternes = /^(nom|contact|acces)-entite-/;
    const donneesEntitesExternes = { entitesExternes: [] };

    Object.keys(params)
      .filter((p) => !!p.match(regExpParametresEntitesExternes))
      .forEach((p) => {
        if (params[p]) {
          const resultat = p.match(/^(nom|contact|acces)-entite-([0-9]*)$/);
          const propriete = resultat[1];
          let index = resultat[2];
          index = parseInt(index, 10);
          donneesEntitesExternes.entitesExternes[index] = (
            donneesEntitesExternes.entitesExternes[index] || {}
          );
          donneesEntitesExternes.entitesExternes[index][propriete] = params[p];
        }
      });
    Object.assign(params, donneesEntitesExternes);

    Object.keys(params).forEach((p) => {
      if (p.match(regExpParametresEntitesExternes)) delete params[p];
    });

    return params;
  };

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  indexMaxEntitesExternes = peupleEntitesExternes('#entites-externes', '#donneesEntitesExternes');
  brancheAjoutEntiteExterne('.nouvelle-entite-externe', '#entites-externes');

  $bouton.click(() => {
    let params = parametres('form#caracteristiques-complementaires');
    params = extraisEntitesExternes(params);
    axios.post(
      `/api/homologation/${identifiantHomologation}/caracteristiquesComplementaires`,
      params,
    ).then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
