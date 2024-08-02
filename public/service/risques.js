import { parametresAvecItemsExtraits } from '../modules/parametres.mjs';
import {
  brancheAjoutItem,
  peupleListeItems,
} from '../modules/saisieListeItems.js';
import texteHTML from '../modules/texteHTML.js';

import $saisieRisqueSpecifique from '../modules/elementsDom/saisieRisqueSpecifique.js';

import ajouteModalesInformations from '../modules/interactions/modalesInformations.mjs';
import {
  brancheComportementSaisieNiveauGravite,
  metsAJourAffichageNiveauGravite,
} from '../modules/interactions/saisieNiveauGravite.js';
import basculeEnCoursChargement from '../modules/enregistreRubrique.mjs';

$(() => {
  let indexMaxRisquesSpecifiques = 0;
  const { estLectureSeule } = JSON.parse($('#autorisations-risques').text());

  const NIVEAUX_GRAVITE = JSON.parse(
    $('#donnees-referentiel-niveaux-gravite-risque').text()
  );
  const COULEURS = Object.values(NIVEAUX_GRAVITE).map(
    (niveau) => niveau.couleur
  );

  const ajouteZoneSaisieCommentairePourRisque = ($r, nom) => {
    const $lien = $('a.informations-additionnelles', $r);
    const $zoneSaisie = $(
      `<textarea id=${nom} name=${nom} ${
        estLectureSeule ? 'readonly' : ''
      }></textarea>`
    );
    $zoneSaisie.hide();
    $lien.click(() => $zoneSaisie.toggle());

    $zoneSaisie.appendTo($r);
  };

  const peupleRisquesGeneraux = (selecteurDonnees) => {
    const donneesRisques = JSON.parse($(selecteurDonnees).text());

    donneesRisques.forEach(({ id, commentaire, niveauGravite }) => {
      if (commentaire)
        $(`#commentaire-${id}`).show().val(texteHTML(commentaire));

      const $risque = $(`.risque#${id}`);
      if (niveauGravite) {
        const { position, description } = NIVEAUX_GRAVITE[niveauGravite];
        metsAJourAffichageNiveauGravite(
          $risque,
          niveauGravite,
          COULEURS,
          position,
          description
        );
      }
    });
  };

  const zoneSaisieRisqueSpecifique = (index, donnees) =>
    $saisieRisqueSpecifique(
      index,
      NIVEAUX_GRAVITE,
      COULEURS,
      donnees,
      estLectureSeule
    );

  const brancheAjoutRisqueSpecifique = (...params) =>
    brancheAjoutItem(
      ...params,
      zoneSaisieRisqueSpecifique,
      () => (indexMaxRisquesSpecifiques += 1)
    );

  const peupleRisquesSpecifiques = (...params) =>
    peupleListeItems(...params, zoneSaisieRisqueSpecifique, {
      lectureSeule: estLectureSeule,
    });

  ajouteModalesInformations();

  $('.risque').each((_, $r) => {
    if (!estLectureSeule)
      brancheComportementSaisieNiveauGravite($r, NIVEAUX_GRAVITE, COULEURS);
    ajouteZoneSaisieCommentairePourRisque($r, `commentaire-${$r.id}`);
  });

  peupleRisquesGeneraux('#donnees-risques-generaux');

  indexMaxRisquesSpecifiques = peupleRisquesSpecifiques(
    '#risques-specifiques',
    '#donnees-risques-specifiques'
  );
  brancheAjoutRisqueSpecifique('.nouvel-item', '#risques-specifiques');

  const $bouton = $('.bouton[idService]');
  const identifiantService = $bouton.attr('idService');

  $bouton.on('click', async (e) => {
    e.preventDefault();
    basculeEnCoursChargement($bouton, true);
    const params = parametresAvecItemsExtraits(
      'form#risques',
      'risquesSpecifiques',
      '^(description|niveauGravite|commentaire)-risque-specifique-'
    );

    const reponse = await axios.post(
      `/api/service/${identifiantService}/risques`,
      params
    );

    basculeEnCoursChargement($bouton, false);
    window.location = `/service/${reponse.data.idService}/risques`;
  });
});
