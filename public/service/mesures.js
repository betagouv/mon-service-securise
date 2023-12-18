import arrangeParametresMesures from '../modules/arrangeParametresMesures.mjs';
import brancheFiltresMesures from '../modules/interactions/brancheFiltresMesures.mjs';
import {
  brancheValidation,
  declencheValidation,
} from '../modules/interactions/validation.mjs';
import parametres from '../modules/parametres.mjs';
import { peupleListeItems } from '../modules/saisieListeItems.js';
import texteHTML from '../modules/texteHTML.js';

import ajouteModalesInformations from '../modules/interactions/modalesInformations.mjs';
import basculeEnCoursChargement from '../modules/enregistreRubrique.mjs';
import { gestionnaireTiroir } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';
import ActionMesure from '../modules/tableauDeBord/actions/ActionMesure.mjs';

$(() => {
  const { estLectureSeule } = JSON.parse($('#autorisations-securiser').text());
  const referentielCategoriesMesures = JSON.parse(
    $('#referentiel-categories-mesures').text()
  );
  const referentielStatutsMesures = JSON.parse(
    $('#referentiel-statuts-mesures').text()
  );

  const $boutonSave = $('.bouton[idHomologation]');
  const identifiantService = $boutonSave.attr('idHomologation');

  const $conteneurModalites = (nom) => {
    const $conteneur = $('<div class="informations-additionnelles"></div>');
    const $lien = $(
      '<a class="informations-additionnelles">Commentaires (facultatif)</a>'
    );
    const $zoneSaisie = $(
      `<textarea id=${nom} name=${nom} ${
        estLectureSeule ? 'readonly' : ''
      }></textarea>`
    );
    $zoneSaisie.hide();

    $lien.on('click', () => {
      $zoneSaisie.toggle();
      if ($zoneSaisie.is(':visible')) $zoneSaisie.focus();
    });

    if (!estLectureSeule) {
      $conteneur.append($lien);
    }
    $conteneur.append($zoneSaisie);
    return $conteneur;
  };

  const ajouteConteneursModalites = () =>
    $('fieldset').each((_, $f) => {
      const nom = `modalites-${$('input', $f)[0].name}`;
      const $modalites = $conteneurModalites(nom);
      $modalites.appendTo($f);
    });

  const sauvegardeLesMesures = async () => {
    const indiqueSauvegardeEnCours = (estEnCours) => {
      basculeEnCoursChargement($boutonSave, estEnCours);
      const $statut = $('#statut-enregistrement');
      $statut.toggleClass('enregistrement-en-cours', estEnCours);
      $statut.toggleClass('enregistrement-termine', !estEnCours);
      $statut.text(estEnCours ? 'Enregistrement en cours…' : 'Terminé');
    };

    const formulaireEstValide = $('form')[0].reportValidity();
    if (!formulaireEstValide) return;

    indiqueSauvegardeEnCours(true);
    const params = parametres('form#mesures');
    arrangeParametresMesures(params);
    await axios.post(`/api/service/${identifiantService}/mesures`, params);
    indiqueSauvegardeEnCours(false);
  };

  const peupleFormulaire = () => {
    const donneesMesuresGenerales = JSON.parse(
      $('#donnees-mesures-generales').text()
    );
    donneesMesuresGenerales.forEach(({ id, statut, modalites }) => {
      $(`#${id}-${statut}`).prop('checked', true);
      if (modalites) $(`#modalites-${id}`).show().val(texteHTML(modalites));
    });
  };

  const zoneSaisieMesureSpecifique = (index, donnees = {}) => {
    const {
      description = '',
      categorie = '',
      statut = '',
      modalites = '',
    } = donnees;

    const choixParBoutonsRadios = (
      referentielChamp,
      nomChamp,
      label,
      valeur
    ) => {
      let boutonsRadios = Object.keys(referentielChamp)
        .map(
          (champ) => `
<input id="${nomChamp}-${champ}-mesure-specifique-${index}"
       name="${nomChamp}-mesure-specifique-${index}"
       value="${champ}"
       ${champ === valeur ? 'checked' : ''}
       type="radio"
       ${estLectureSeule ? 'disabled' : ''}
       required>
<label for="${nomChamp}-${champ}-mesure-specifique-${index}">${
            referentielChamp[champ]
          }</label>
<br>
    `
        )
        .join('');
      boutonsRadios = `
<div class="requis propriete-specifique">
  <span class="nom-champ">${label}</span>
  ${boutonsRadios}
  <div class="message-erreur">Ce champ est obligatoire. Veuillez le renseigner.</div>
</div>
      `;
      return boutonsRadios;
    };
    const categories = choixParBoutonsRadios(
      referentielCategoriesMesures,
      'categorie',
      'Catégorie',
      categorie
    );

    const statuts = choixParBoutonsRadios(
      referentielStatutsMesures,
      'statut',
      'Statut de mise en œuvre',
      statut
    );

    return `
<div class="requis propriete-specifique">
  <label for="description-mesure-specifique-${index}" class="nom-champ">
    Intitulé
    <input id="description-mesure-specifique-${index}"
          type="text"
          name="description-mesure-specifique-${index}"
          placeholder="Description de la mesure"
          value="${description}"
          ${estLectureSeule ? 'readonly' : ''}
          required>
    <div class="message-erreur">L'intitulé est obligatoire. Veuillez le renseigner.</div>
  </label>
</div>

${categories}

${statuts}

<label for="modalites-mesure-specifique-${index}" class="nom-champ propriete-specifique">
  Précisions sur la mesure dans le cadre de votre organisation
  <textarea id="modalites-mesure-specifique-${index}"
            name="modalites-mesure-specifique-${index}"
            placeholder="Modalités de mise en œuvre (facultatif)" ${
              estLectureSeule ? 'readonly' : ''
            }>${modalites}</textarea>
</label>
      `;
  };

  const peupleMesuresSpecifiques = (...params) =>
    peupleListeItems(...params, zoneSaisieMesureSpecifique, {
      ordreInverse: true,
      lectureSeule: estLectureSeule,
    });

  ajouteModalesInformations();

  brancheFiltresMesures(
    'actif',
    'form#mesures nav > a',
    '.mesure',
    '.item-ajoute'
  );
  ajouteConteneursModalites();

  peupleFormulaire();

  peupleMesuresSpecifiques(
    '#mesures-specifiques',
    '#donnees-mesures-specifiques'
  );

  brancheValidation('form#mesures');

  const brancheAutoSave = () => {
    const formulaire = 'form#mesures';
    $('input[type="radio"]', formulaire).on('change', async () =>
      sauvegardeLesMesures()
    );
    $('input[type="text"]', formulaire).on('blur', async () =>
      sauvegardeLesMesures()
    );
    $('textarea', formulaire).on('blur', async () => sauvegardeLesMesures());
    $('.icone-suppression', formulaire).on('click', async () =>
      sauvegardeLesMesures()
    );
  };

  brancheAutoSave();

  $boutonSave.on('click', () => declencheValidation('form#mesures'));

  $('form#mesures').on('submit', async (evenement) => {
    evenement.preventDefault();
    await sauvegardeLesMesures();
  });

  const actionMesure = new ActionMesure();
  $('#ajout-mesure-specifique').on('click', () => {
    const mesuresExistantes = parametres('form#mesures');
    arrangeParametresMesures(mesuresExistantes);
    gestionnaireTiroir.afficheContenuAction(
      { action: actionMesure },
      {
        idService: identifiantService,
        categories: referentielCategoriesMesures,
        statuts: referentielStatutsMesures,
        mesuresExistantes,
      }
    );
  });
});
