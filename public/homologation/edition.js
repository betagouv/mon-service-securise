import { initialiseComportementModale, soumetsHomologation } from '../modules/soumetsHomologation.js';

$(() => {
  const $bouton = $('.bouton#diagnostic');
  const identifiantHomologation = $bouton.attr('identifiant');
  const url = { method: 'put', url: `/api/homologation/${identifiantHomologation}` };
  const selecteurFormulaire = 'form#homologation';
  const $form = $(selecteurFormulaire);

  initialiseComportementModale(url, selecteurFormulaire);

  $form.submit((e) => {
    e.preventDefault();
    soumetsHomologation(selecteurFormulaire);
  });

  $bouton.click(() => $form.submit());
});
