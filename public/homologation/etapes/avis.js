import { brancheConteneur } from '../../modules/interactions/validation.mjs';
import brancheElementsAjoutables from '../../modules/brancheElementsAjoutables.js';

const templateZoneDeSaisie = (template) => (index) => (
  $(template.replace('INDEX_AVIS', index + 1).replaceAll('INDEX', index))
);

$(() => {
  const template = $('#element-ajoutable-template').get(0).innerHTML;
  $('#element-ajoutable-template').remove();
  brancheElementsAjoutables('avis', 'un-avis', {}, templateZoneDeSaisie(template), brancheConteneur);
});
