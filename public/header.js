$(() => {
  const header = document.querySelector('dsfr-header');

  const updateLogo = () => {
    const isMobile = window.innerWidth < 768;
    header.setAttribute(
      'brand-operator-src',
      isMobile
        ? '/statique/assets/images/logo_ANSSI.svg'
        : '/statique/assets/images/logo_ANSSI_MSS.svg'
    );
  };

  updateLogo();
  window.addEventListener('resize', updateLogo);
});
