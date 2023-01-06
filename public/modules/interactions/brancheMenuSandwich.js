const brancheMenuSandwich = () => {
  const $menu = $('header nav');
  const $sandwich = $('.sandwich');
  const $boutonFermer = $('.bouton-fermer', $menu);

  const interrupteurVisible = (visible) => {
    $menu.toggleClass('visible', visible);
    $('body').toggleClass('sans-ascenseur', visible);
  };

  $sandwich.on('click', () => interrupteurVisible(true));

  $boutonFermer.on('click', () => interrupteurVisible(false));
};

export default brancheMenuSandwich;
