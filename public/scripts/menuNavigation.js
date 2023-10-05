import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionContributeurs from '../modules/tableauDeBord/actions/ActionContributeurs.mjs';

const tiroirContributeur = (idService) => {
  const contributeurs = new ActionContributeurs();
  let donneesService;
  const rechargeNbContributeurs = async () => {
    const reponse = await axios.get(`/api/service/${idService}`);
    donneesService = reponse.data;
    $('.nombre-contributeurs', '#gerer-contributeurs').text(
      donneesService.contributeurs.length + 1
    );
  };

  return {
    brancheComportement: () => {
      gestionnaireTiroir.brancheComportement();

      if (idService) rechargeNbContributeurs();

      $(document.body).on('jquery-recharge-services', async () => {
        await rechargeNbContributeurs();
      });

      $('#gerer-contributeurs').on('click', () => {
        gestionnaireTiroir.afficheContenuAction(
          { action: contributeurs, estSelectionMulitple: false },
          { donneesServices: [donneesService] }
        );
      });
    },
  };
};

$(() => {
  const $menu = $('.menu-navigation');
  const $repliMenu = $('.repli-menu', $menu);
  const idService = $('.page-service').data('id-service');

  const cookie = () => {
    const cookieAvecAge = (ageEnSecondes) =>
      `etat-menu-navigation=ferme; path=/; max-age=${ageEnSecondes}`;
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

  $repliMenu.on('click', () => {
    const menuOuvert = !$menu.hasClass('ferme');
    if (menuOuvert) {
      $menu.addClass('ferme');
      persistance.fermer();
    } else {
      $menu.removeClass('ferme');
      persistance.ouvrir();
    }
  });

  tiroirContributeur(idService).brancheComportement();
});
