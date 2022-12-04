$(() => {
  const $boutonSuivant = $('.bouton#suivant');
  const $boutonFinal = $('.bouton#final');

  const idHomologation = $boutonSuivant.attr('idHomologation') || $boutonFinal.attr('idHomologation');
  const idEtapeSuivante = $boutonSuivant.attr('idEtapeSuivante');

  $boutonSuivant.on('click', () => (window.location = `/homologation/${idHomologation}/dossier/edition/etape/${idEtapeSuivante}`));
  $boutonFinal.on('click', () => (window.location = `/homologation/${idHomologation}/dossiers`));
});
