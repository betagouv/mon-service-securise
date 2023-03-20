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

$(() => {
  const template = $('#element-ajoutable-template').get(0).innerHTML;
  $('#element-ajoutable-template').remove();
  brancheElementsAjoutables('avis', 'un-avis', {}, templateZoneDeSaisie(template), brancheConteneur);

  brancheComportemenFormulaireEtape(soumissionEtapeAvis('form'));
});
