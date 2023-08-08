$(() => {
  const $menu = $('.menu-navigation');
  const $repliMenu = $('.repli-menu', $menu);

  $repliMenu.on('click', () => {
    const menuOuvert = !$menu.hasClass('ferme');
    if (menuOuvert) $menu.addClass('ferme');
    else $menu.removeClass('ferme');
  });
});
