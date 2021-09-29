import parametres from '../modules/parametres.js';

$(() => {
  let indexMaxEntitesExternes = 0;

  const afficheZoneSaisieEntiteExterne = (selecteur, index, donneesEntiteExterne = {}) => {
    const conteneurSaisieEntitesExternes = $(selecteur);
    const proprieteNom = `nom-entite-${index}`;
    const proprieteAcces = `acces-entite-${index}`;
    const { nom = '', acces = '' } = donneesEntiteExterne;
    conteneurSaisieEntitesExternes.append(`
<label>
  <input
    id="${proprieteNom}"
    name="${proprieteNom}"
    type="text"
    placeholder="Nom de l'entité"
    value="${nom}">
  <input
    id="${proprieteAcces}"
    name="${proprieteAcces}"
    type="text"
    placeholder="Nature de l'accès"
    value="${acces}">
</label>
    `);
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
    const regExpParametresEntitesExternes = /^(nom|acces)-entite-/;
    const donneesEntitesExternes = { entitesExternes: [] };

    Object.keys(params)
      .filter((p) => !!p.match(regExpParametresEntitesExternes))
      .forEach((p) => {
        if (params[p]) {
          const resultat = p.match(/^(nom|acces)-entite-([0-9]*)$/);
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
