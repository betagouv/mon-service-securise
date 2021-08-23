import soumetsHomologation from '../modules/soumetsHomologation.js';

$(() => {
  const $bouton = $('.bouton');
  const selecteurFormulaire = 'form#homologation';
  const $form = $(selecteurFormulaire);

  $form.submit((e) => {
    e.preventDefault();
    soumetsHomologation({ method: 'post', url: '/api/homologation' }, selecteurFormulaire);
  });

  $bouton.click(() => $form.submit());
});
