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

const repliMenu = () => {
  const $menu = $('.menu-navigation');
  const $repliMenu = $('.repli-menu', $menu);
  const $gererContributeurs = $('#gerer-contributeurs', $menu);

  const cookie = () => {
    const cookieAvecAge = (ageEnSecondes) =>
      `etat-menu-navigation=ferme; SameSite=Strict; path=/; max-age=${ageEnSecondes}`;
    const unAn = 3600 * 24 * 365;
    return {
      poserPourUnAn: () => (document.cookie = cookieAvecAge(unAn)),
      supprimer: () => (document.cookie = cookieAvecAge(-1)),
    };
  };

  const persistance = {
    fermer: () => cookie().poserPourUnAn(),
    ouvrir: () => cookie().supprimer(),
  };

  return {
    brancheComportement: () => {
      $repliMenu.on('click', () => {
        const menuOuvert = !$menu.hasClass('ferme');
        if (menuOuvert) {
          $menu.addClass('ferme');
          persistance.fermer();
          $gererContributeurs.removeClass('ouvert');
        } else {
          $menu.removeClass('ferme');
          persistance.ouvrir();
          $gererContributeurs.addClass('ouvert');
        }
      });

      $(document.body).on('jquery-deplie-menu-navigation-visite-guidee', () => {
        const menuFerme = $menu.hasClass('ferme');
        if (menuFerme) {
          $menu.removeClass('ferme');
          $gererContributeurs.addClass('ouvert');
        }
      });

      $(document.body).on('jquery-replie-menu-navigation-visite-guidee', () => {
        const menuFerme = $menu.hasClass('ferme');
        if (!menuFerme) {
          $menu.addClass('ferme');
          $gererContributeurs.removeClass('ouvert');
        }
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

  repliMenu().brancheComportement();

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
          contactsUtiles: !autorisationsService.CONTACTS.estMasque,
          risques: !autorisationsService.RISQUES.estMasque,
          descriptionService: !autorisationsService.DECRIRE.estMasque,
          mesures: !autorisationsService.SECURISER.estMasque,
          dossiers: !autorisationsService.HOMOLOGUER.estMasque,
        },
      },
    })
  );

  const service = lisDonneesPartagees('service');
  const { indiceCyber, noteMax } = lisDonneesPartagees('donnees-indice-cyber');
  const { indiceCyberPersonnalise } = lisDonneesPartagees(
    'donnees-indice-cyber-personnalise'
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-entete-page-service', {
      detail: {
        idService: modeVisiteGuidee ? undefined : idService,
        nomService: service.descriptionService.nomService,
        organisationResponsable:
          service.descriptionService.organisationResponsable.nom,
        indiceCyber,
        indiceCyberPersonnalise,
        noteMax,
      },
    })
  );
});
