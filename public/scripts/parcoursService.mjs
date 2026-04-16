import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionTelechargement from '../modules/tableauDeBord/actions/ActionTelechargement.mjs';
import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

const tiroirTelechargement = (idService) => {
  const telechargement = new ActionTelechargement();
  const chargeDonneesService = async () =>
    (await axios.get(`/api/service/${idService}`)).data;

  return {
    brancheComportement: () => {
      $(document.body).on(
        'jquery-affiche-tiroir-telechargement-visite-guidee',
        () =>
          gestionnaireTiroir.afficheContenuAction(
            { action: telechargement, estSelectionMulitple: false },
            { modeVisiteGuidee: true }
          )
      );

      $('#voir-telechargement').on('click', async () => {
        const donneesService = await chargeDonneesService();
        gestionnaireTiroir.afficheContenuAction(
          { action: telechargement, estSelectionMulitple: false },
          { idService, donneesService }
        );
      });
    },
  };
};

$(async () => {
  const idService = $('.page-service').data('id-service');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const modeVisiteGuidee =
    etatVisiteGuidee.dejaTerminee === false &&
    etatVisiteGuidee.enPause === false;

  gestionnaireTiroir.brancheComportement();
  tiroirTelechargement(idService).brancheComportement();

  const autorisationsService = lisDonneesPartagees('autorisations-service');
  const etapeActive = lisDonneesPartagees('etape-active');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-menu-navigation-service', {
      detail: {
        idService,
        etapeActive,
        modeVisiteGuidee,
        visible: {
          rolesResponsabilites: !autorisationsService.CONTACTS.estMasque,
          risques: !autorisationsService.RISQUES.estMasque,
          descriptionService: !autorisationsService.DECRIRE.estMasque,
          mesures: !autorisationsService.SECURISER.estMasque,
          dossiers: !autorisationsService.HOMOLOGUER.estMasque,
        },
      },
    })
  );

  const { nomService, nomOrganisationResponsable } =
    lisDonneesPartagees('service');
  const { indiceCyber, noteMax } = lisDonneesPartagees('donnees-indice-cyber');
  const { indiceCyberPersonnalise } = lisDonneesPartagees(
    'donnees-indice-cyber-personnalise'
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-entete-page-service', {
      detail: {
        idService: modeVisiteGuidee ? undefined : idService,
        nomService,
        organisationResponsable: nomOrganisationResponsable,
        indiceCyber,
        indiceCyberPersonnalise,
        noteMax,
      },
    })
  );
});
