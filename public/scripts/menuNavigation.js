$(() => {
  const $menu = $('.menu-navigation');
  const $repliMenu = $('.repli-menu', $menu);

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
});
