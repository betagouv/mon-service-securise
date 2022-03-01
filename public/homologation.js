import initialiseComportementFormulaire from './modules/soumetsHomologation.mjs';

$(() => {
  initialiseComportementFormulaire('form#homologation', '.bouton#diagnostic');
});
