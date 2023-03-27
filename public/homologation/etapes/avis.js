import arrangeParametresAvis from '../../modules/arrangeParametresAvis.mjs';
import brancheComportemenFormulaireEtape from './formulaireEtape.js';
import { brancheConteneur } from '../../modules/interactions/validation.mjs';
import brancheElementsAjoutables from '../../modules/brancheElementsAjoutables.js';
import parametres from '../../modules/parametres.mjs';

const estValeurAvecAvis = (valeur) => valeur === '0';

const soumissionEtapeAvis = (selecteurFormulaire) => (idService) => {
  const $radioAvisSelectionne = $('input:radio:checked', 'fieldset#avecAvis');
  const avecAvis = estValeurAvecAvis($radioAvisSelectionne.val());
  return (
    axios.put(
      `/api/service/${idService}/dossier/avis`,
      { ...arrangeParametresAvis(parametres(selecteurFormulaire)), avecAvis }
    )
  );
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

const brancheBoutonsRadio = () => {
  const $conteneurRadioBouton = $('fieldset#avecAvis');

  $conteneurRadioBouton.on('change', (e) => {
    const avecAvis = estValeurAvecAvis($(e.target).val());

    if (avecAvis) {
      $('#ajout-element-un-avis').removeClass('invisible').click();
    } else {
      $('.elements-ajoutables#avis').empty();
      $('#ajout-element-un-avis').addClass('invisible');
    }
  });
};

const templateZoneDeSaisie = (template) => (index) => (
  $(template.replace('INDEX_AVIS', index + 1).replaceAll('INDEX', index))
);

$(() => {
  brancheBoutonsRadio();

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
