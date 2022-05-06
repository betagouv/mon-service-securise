import arrangeParametresMesures from '../modules/arrangeParametresMesures.mjs';
import parametres from '../modules/parametres.mjs';
import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';
import texteHTML from '../modules/texteHTML.js';

import ajouteModalesInformations from '../modules/interactions/modalesInformations.mjs';

$(() => {
  let indexMaxMesuresSpecifiques = 0;

  const mesureSpecifiqueDeCategorie = (elementMesureSpecifique, categorieFiltre) => (
    categorieFiltre
      ? $(`option[value="${categorieFiltre}"]:selected, option[value=""]:selected`, elementMesureSpecifique).length === 1
      : true
  );

  const filtreMesures = (categorieFiltre) => {
    $('.mesure').each((_, item) => $(item).toggle($(item).hasClass(categorieFiltre)));
    $('.item-ajoute').each((_, item) => $(item)
      .toggle(mesureSpecifiqueDeCategorie(item, categorieFiltre)));
  };

  const brancheFiltres = (selecteurFiltres) => {
    const $filtres = $(selecteurFiltres);
    $filtres.each((_, f) => {
      $(f).on('click', (e) => {
        $('.actif').removeClass('actif');
        $(e.target).addClass('actif');

        const idCategorie = e.target.id;
        filtreMesures(idCategorie);
      });
    });
  };

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
    const statuts = Object.keys(referentielStatutsMesures).map((s) => `
<input id="statut-${s}-mesure-specifique-${index}"
       name="statut-mesure-specifique-${index}"
       value="${s}"
       ${s === statut ? 'checked' : ''}
       type="radio">
<label for="statut-${s}-mesure-specifique-${index}">${referentielStatutsMesures[s]}</label>
<br>
    `).join('');

    return `
<input id="description-mesure-specifique-${index}"
       name="description-mesure-specifique-${index}"
       placeholder="Description de la mesure"
       value="${description}">

<select id="categorie-mesure-specifique-${index}" name="categorie-mesure-specifique-${index}">
  <option value="">--Catégorie--</option>
  ${options}
</select>

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
  );

  const peupleMesuresSpecifiques = (...params) => (
    peupleListeItems(...params, zoneSaisieMesureSpecifique)
  );

  ajouteModalesInformations();

  brancheFiltres('form#mesures nav > a');

  ajouteConteneursModalites();
  peupleFormulaire();

  indexMaxMesuresSpecifiques = peupleMesuresSpecifiques('#mesures-specifiques', '#donnees-mesures-specifiques');
  brancheAjoutMesureSpecifique('.nouvel-item', '#mesures-specifiques');

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.on('click', () => {
    const params = parametres('form#mesures');
    arrangeParametresMesures(params);

    axios.post(`/api/homologation/${identifiantHomologation}/mesures`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
