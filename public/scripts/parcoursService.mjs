import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(async () => {
  const idService = $('.page-service').data('id-service');
  const etatVisiteGuidee = lisDonneesPartagees('etat-visite-guidee');
  const modeVisiteGuidee =
    etatVisiteGuidee.dejaTerminee === false &&
    etatVisiteGuidee.enPause === false;

  gestionnaireTiroir.brancheComportement();

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
        avecIndiceCyber: !autorisationsService.SECURISER.estMasque,
      },
    })
  );
});
