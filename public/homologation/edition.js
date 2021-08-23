import soumetsHomologation from '../modules/soumetsHomologation.js';

$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');
  const selecteurFormulaire = 'form#homologation';
  const $form = $(selecteurFormulaire);

  $form.submit((e) => {
    e.preventDefault();
    soumetsHomologation(
      { method: 'put', url: `/api/homologation/${identifiantHomologation}` },
      selecteurFormulaire
    );
  });

  $bouton.click(() => $form.submit());
});
