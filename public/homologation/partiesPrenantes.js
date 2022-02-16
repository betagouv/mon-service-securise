import parametres, { modifieParametresAvecItemsExtraits, modifieParametresGroupementElements } from '../modules/parametres.mjs';
import brancheElementsAjoutables from '../modules/brancheElementsAjoutables.js';

$(() => {
  brancheElementsAjoutables('acteurs-homologation', 'acteur-homologation', {
    role: { label: 'Rôle au regard du projet' },
    nom: { label: 'Nom / Prénom' },
    fonction: { label: 'Fonction' },
  });

  const tousLesParametres = (selecteurFormulaire) => {
    const params = parametres(selecteurFormulaire);
    modifieParametresAvecItemsExtraits(
      params, 'acteursHomologation', '^(role|nom|fonction)-acteur-homologation-'
    );
    modifieParametresGroupementElements(
      params, 'partiesPrenantes', 'hebergement'
    );
    return params;
  };

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = tousLesParametres('form#parties-prenantes');

    axios.post(`/api/homologation/${identifiantHomologation}/partiesPrenantes`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
