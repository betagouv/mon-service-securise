import arrangeParametresAvis from '../../modules/arrangeParametresAvis.mjs';
import brancheComportemenFormulaireEtape from './formulaireEtape.js';
import { brancheConteneur } from '../../modules/interactions/validation.mjs';
import brancheElementsAjoutables from '../../modules/brancheElementsAjoutables.js';
import parametres from '../../modules/parametres.mjs';

const templateZoneDeSaisie = (template) => (index) => (
  $(template.replace('INDEX_AVIS', index + 1).replaceAll('INDEX', index))
);

const soumissionEtapeAvis = (selecteurFormulaire) => (idService) => {
  const tousLesParametres = (selecteur) => {
    const params = parametres(selecteur);

    return arrangeParametresAvis(params);
  };
  return axios.put(`/api/service/${idService}/dossier/avis`, tousLesParametres(selecteurFormulaire));
};

const brancheCollaborateursEtiquettes = (conteneurSaisieItem) => {
  $("[id^='collaborateurs-un-avis-']", conteneurSaisieItem).selectize({
    create: true,
    persist: false,
    plugins: ['remove_button'],
    render: {
      option_create: (data, escape) => `<div class="create">Ajouter <strong>${escape(data.input)}</strong>&#x2026;</div>`,
    },
    sortField: [{ field: 'value', direction: 'asc' }],
  });
};

$(() => {
  const template = $('#element-ajoutable-template').get(0).innerHTML;
  $('#element-ajoutable-template').remove();
  const actionSurZoneSaisieApresAjout = ($conteneurSaisieItem) => {
    brancheCollaborateursEtiquettes($conteneurSaisieItem);
    brancheConteneur($conteneurSaisieItem);
  };

  brancheElementsAjoutables('avis', 'un-avis', {}, templateZoneDeSaisie(template), actionSurZoneSaisieApresAjout);

  $('#avis .item-ajoute').each((_indice, element) => {
    brancheCollaborateursEtiquettes($(element));
  });
  brancheComportemenFormulaireEtape(soumissionEtapeAvis('form'));
});
