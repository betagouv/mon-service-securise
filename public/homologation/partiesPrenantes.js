import parametres, { modifieParametresAvecItemsExtraits } from '../modules/parametres.js';
import brancheElementsAjoutables from '../modules/brancheElementsAjoutables.js';
import brancheInputsIdentite from '../modules/brancheInputsIdentite.js';

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
    return params;
  };

  const idsInputsIdentite = [
    { idJeSuis: '#jeSuisPiloteProjet', idZoneSaisie: '#piloteProjet' },
    { idJeSuis: '#jeSuisExpertCybersecurite', idZoneSaisie: '#expertCybersecurite' },
  ];

  brancheInputsIdentite(idsInputsIdentite);

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    idsInputsIdentite
      .map((ids) => ids.idZoneSaisie)
      .forEach((selecteur) => $(selecteur).removeAttr('disabled'));

    const params = tousLesParametres('form#parties-prenantes');

    axios.post(`/api/homologation/${identifiantHomologation}/partiesPrenantes`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
