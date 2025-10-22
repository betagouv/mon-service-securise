const brancheMenuSandwich = () => {
  const $menu = $('header nav');
  const $sandwich = $('.sandwich');
  const $boutonFermer = $('.bouton-fermer', $menu);

  const interrupteurVisible = (visible) => {
    $menu.toggleClass('visible', visible);
    $('body').toggleClass('sans-ascenseur', visible);
  };

  $sandwich.on('click', () => {
    interrupteurVisible(true);
    window.scrollTo(0, 0);
  });

  $boutonFermer.on('click', () => interrupteurVisible(false));
};

export default brancheMenuSandwich;
