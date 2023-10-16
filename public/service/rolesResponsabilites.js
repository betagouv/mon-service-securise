import arrangeParametresPartiesPrenantes from '../modules/arrangeParametresPartiesPrenantes.mjs';
import parametres from '../modules/parametres.mjs';
import brancheElementsAjoutables from '../modules/brancheElementsAjoutables.js';
import brancheOnglets from '../modules/interactions/brancheOnglets.mjs';
import basculeEnCoursChargement from '../modules/enregistreRubrique.mjs';

const tousLesParametres = (selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);

  arrangeParametresPartiesPrenantes(params);

  return params;
};

$(() => {
  brancheOnglets('#onglets-liens > a');

  brancheElementsAjoutables('acteurs-homologation', 'acteur-homologation', {
    role: { label: 'Rôle au regard du projet' },
    nom: { label: 'Nom / Prénom' },
    fonction: { label: 'Fonction' },
  });

  brancheElementsAjoutables(
    'parties-prenantes-specifiques',
    'partie-prenante-specifique',
    {
      nom: { label: "Nom de l'entité" },
      natureAcces: { label: "Nature de l'accès au service numérique" },
      pointContact: { label: 'Point de contact' },
    }
  );

  const $bouton = $('.bouton[idHomologation]');
  const identifiantService = $bouton.attr('idHomologation');

  $bouton.on('click', async () => {
    basculeEnCoursChargement($bouton, true);
    const params = tousLesParametres('form#roles-responsabilites');

    const reponse = await axios.post(
      `/api/service/${identifiantService}/rolesResponsabilites`,
      params
    );
    basculeEnCoursChargement($bouton, false);

    window.location = `/service/${reponse.data.idService}/rolesResponsabilites`;
  });
});
