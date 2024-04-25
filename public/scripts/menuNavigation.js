import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionContributeurs from '../modules/tableauDeBord/actions/ActionContributeurs.mjs';
import ActionTelechargement from '../modules/tableauDeBord/actions/ActionTelechargement.mjs';

const tiroirContributeur = (idService, modeVisiteGuidee = false) => {
  const contributeurs = new ActionContributeurs();
  let donneesService;
  const rechargeNbContributeurs = async () => {
    if (modeVisiteGuidee) {
      donneesService = {
        nombreContributeurs: 3,
      };
    } else {
      const reponse = await axios.get(`/api/service/${idService}`);
      donneesService = reponse.data;
    }
    $('.nombre-contributeurs', '#gerer-contributeurs').text(
      donneesService.nombreContributeurs
    );
  };

  return {
    brancheComportement: () => {
      if (idService) rechargeNbContributeurs();

      $(document.body).on('jquery-recharge-services', async () => {
        await rechargeNbContributeurs();
      });

      $(document.body).on(
        'jquery-affiche-tiroir-contributeurs-visite-guidee',
        () =>
          gestionnaireTiroir.afficheContenuAction(
            { action: contributeurs, estSelectionMulitple: false },
            { modeVisiteGuidee: true }
          )
      );

      $('#gerer-contributeurs').on('click', () => {
        gestionnaireTiroir.afficheContenuAction(
          { action: contributeurs, estSelectionMulitple: false },
          { donneesServices: [donneesService] }
        );
      });
    },
  };
};

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

  const fermeApresDelai = () => {
    setTimeout(() => {
      $gererContributeurs.removeClass('ouvert');
    }, 3000);
  };

  return {
    brancheComportement: () => {
      fermeApresDelai();

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
          fermeApresDelai();
        }
      });
    },
  };
};

$(() => {
  const idService = $('.page-service').data('id-service');
  const etatVisiteGuidee = JSON.parse($('#etat-visite-guidee').text());
  const modeVisiteGuidee = etatVisiteGuidee.dejaTerminee === false;

  repliMenu().brancheComportement();

  gestionnaireTiroir.brancheComportement();
  tiroirContributeur(idService, modeVisiteGuidee).brancheComportement();
  tiroirTelechargement(idService).brancheComportement();
});
