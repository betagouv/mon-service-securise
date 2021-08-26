import { initialiseComportementModale, soumetsHomologation } from '../modules/soumetsHomologation.js';

$(() => {
  const $bouton = $('.bouton#diagnostic');
  const url = { method: 'post', url: '/api/homologation' };
  const selecteurFormulaire = 'form#homologation';
  const $form = $(selecteurFormulaire);

  initialiseComportementModale(url, selecteurFormulaire);

  $form.submit((e) => {
    e.preventDefault();
    soumetsHomologation(selecteurFormulaire);
  });

  $bouton.click(() => $form.submit());
});
