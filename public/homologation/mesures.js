import arrangeParametresMesures from '../modules/arrangeParametresMesures.mjs';
import brancheFiltresMesures from '../modules/interactions/brancheFiltresMesures.mjs';
import { brancheConteneur, brancheValidation, declencheValidation } from '../modules/interactions/validation.js';
import parametres from '../modules/parametres.mjs';
import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';
import texteHTML from '../modules/texteHTML.js';

import ajouteModalesInformations from '../modules/interactions/modalesInformations.mjs';

$(() => {
  let indexMaxMesuresSpecifiques = 0;

  const $conteneurModalites = (nom) => {
    const $conteneur = $('<div class="informations-additionnelles"></div>');
    const $lien = $('<a class="informations-additionnelles">Précisez les modalités de mise en œuvre (facultatif)</a>');
    const $zoneSaisie = $(`<textarea id=${nom} name=${nom}></textarea>`);
    $zoneSaisie.hide();

    $lien.on('click', () => {
      $zoneSaisie.toggle();
      if ($zoneSaisie.is(':visible')) $zoneSaisie.focus();
    });

    $conteneur.append($lien, $zoneSaisie);
    return $conteneur;
  };

  const ajouteConteneursModalites = () => $('fieldset').each((_, $f) => {
    const nom = `modalites-${$('input', $f)[0].name}`;
    const $modalites = $conteneurModalites(nom);
    $modalites.appendTo($f);
  });

  const peupleFormulaire = () => {
    const donneesMesuresGenerales = JSON.parse($('#donnees-mesures-generales').text());
    donneesMesuresGenerales.forEach(({ id, statut, modalites }) => {
      $(`#${id}-${statut}`).prop('checked', true);
      if (modalites) $(`#modalites-${id}`).show().val(texteHTML(modalites));
    });
  };

  const zoneSaisieMesureSpecifique = (index, donnees = {}) => {
    const { description = '', categorie = '', statut = '', modalites = '' } = donnees;

    const referentielCategoriesMesures = JSON.parse($('#referentiel-categories-mesures').text());
    const options = Object.keys(referentielCategoriesMesures).map((c) => (`
<option value="${c}"${c === categorie ? ' selected' : ''}>
  ${referentielCategoriesMesures[c]}
</option>
    `)).join('');

    const referentielStatutsMesures = JSON.parse($('#referentiel-statuts-mesures').text());
    let statuts = Object.keys(referentielStatutsMesures).map((s) => `
<input id="statut-${s}-mesure-specifique-${index}"
       name="statut-mesure-specifique-${index}"
       value="${s}"
       ${s === statut ? 'checked' : ''}
       type="radio"
       required>
<label for="statut-${s}-mesure-specifique-${index}">${referentielStatutsMesures[s]}</label>
<br>
    `).join('');
    statuts = `<div class="requis">${statuts}<div class="message-erreur">Ce champ est obligatoire. Veuillez le renseigner.</div></div>`;

    return `
<div class="requis">
  <input id="description-mesure-specifique-${index}"
        name="description-mesure-specifique-${index}"
        placeholder="Description de la mesure"
        value="${description}"
        required>
  <div class="message-erreur">L'intitulé est obligatoire. Veuillez le renseigner.</div>
</div>

<div class="requis selecteur-options">
  <select id="categorie-mesure-specifique-${index}" name="categorie-mesure-specifique-${index}" required>
    <option value="">--Catégorie--</option>
    ${options}
  </select>
  <div class="message-erreur">Ce champ est obligatoire. Veuillez sélectionner une entrée.</div>
</div>

${statuts}

<textarea id="modalites-mesure-specifique-${index}"
          name="modalites-mesure-specifique-${index}"
          placeholder="Modalités de mise en œuvre (facultatif)">${modalites}</textarea>
      `;
  };

  const brancheAjoutMesureSpecifique = (...params) => brancheAjoutItem(
    ...params,
    zoneSaisieMesureSpecifique,
    () => (indexMaxMesuresSpecifiques += 1),
    { ordreInverse: true },
    brancheConteneur,
  );

  const peupleMesuresSpecifiques = (...params) => (
    peupleListeItems(...params, zoneSaisieMesureSpecifique, { ordreInverse: true })
  );

  ajouteModalesInformations();

  brancheFiltresMesures('actif', 'form#mesures nav > a', '.mesure', '.item-ajoute');

  ajouteConteneursModalites();
  peupleFormulaire();

  indexMaxMesuresSpecifiques = peupleMesuresSpecifiques('#mesures-specifiques', '#donnees-mesures-specifiques');
  brancheAjoutMesureSpecifique('.nouvel-item', '#mesures-specifiques');

  brancheValidation('form#mesures');

  const $bouton = $('.bouton[idHomologation]');
  const identifiantHomologation = $bouton.attr('idHomologation');

  $bouton.on('click', () => {
    declencheValidation('form#mesures');
  });
  
  $('form#mesures').on('submit', (evenement) => {
    evenement.preventDefault();
    const params = parametres('form#mesures');
    arrangeParametresMesures(params);

    axios.post(`/api/homologation/${identifiantHomologation}/mesures`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
