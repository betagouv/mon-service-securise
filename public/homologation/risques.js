import { parametresAvecItemsExtraits } from '../modules/parametres.mjs';
import { brancheAjoutItem, peupleListeItems } from '../modules/saisieListeItems.js';
import texteHTML from '../modules/texteHTML.js';

import $saisieRisqueSpecifique from '../modules/elementsDom/saisieRisqueSpecifique.js';

import ajouteModalesInformations from '../modules/interactions/modalesInformations.mjs';
import {
  brancheComportementSaisieNiveauGravite,
  metsAJourAffichageNiveauGravite,
} from '../modules/interactions/saisieNiveauGravite.js';

$(() => {
  let indexMaxRisquesSpecifiques = 0;

  const NIVEAUX_GRAVITE = JSON.parse($('#donnees-referentiel-niveaux-gravite-risque').text());

  const ajouteZoneSaisieCommentairePourRisque = ($r, nom) => {
    const $lien = $('a.informations-additionnelles', $r);
    const $zoneSaisie = $(`<textarea id=${nom} name=${nom}></textarea>`);
    $zoneSaisie.hide();
    $lien.click(() => $zoneSaisie.toggle());

    $zoneSaisie.appendTo($r);
  };

  const peupleRisquesGeneraux = (selecteurDonnees) => {
    const donneesRisques = JSON.parse($(selecteurDonnees).text());
    donneesRisques.forEach(({ id, commentaire, niveauGravite }) => {
      if (commentaire) $(`#commentaire-${id}`).show().val(texteHTML(commentaire));

      const $risque = $(`.risque#${id}`);
      if (niveauGravite) {
        const { position, description } = NIVEAUX_GRAVITE[niveauGravite];
        metsAJourAffichageNiveauGravite($risque, niveauGravite, position, description);
      }
    });
  };

  const zoneSaisieRisqueSpecifique = (...params) => (
    $saisieRisqueSpecifique(...params, NIVEAUX_GRAVITE)
  );

  const brancheAjoutRisqueSpecifique = (...params) => brancheAjoutItem(
    ...params,
    zoneSaisieRisqueSpecifique,
    () => (indexMaxRisquesSpecifiques += 1),
  );

  const peupleRisquesSpecifiques = (...params) => (
    peupleListeItems(...params, zoneSaisieRisqueSpecifique)
  );

  ajouteModalesInformations();

  $('.risque').each((_, $r) => {
    brancheComportementSaisieNiveauGravite($r, NIVEAUX_GRAVITE);
    ajouteZoneSaisieCommentairePourRisque($r, `commentaire-${$r.id}`);
  });

  peupleRisquesGeneraux('#donnees-risques-generaux');

  indexMaxRisquesSpecifiques = peupleRisquesSpecifiques('#risques-specifiques', '#donnees-risques-specifiques');
  brancheAjoutRisqueSpecifique('.nouvel-item', '#risques-specifiques');

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametresAvecItemsExtraits(
      'form#risques',
      'risquesSpecifiques',
      '^(description|niveauGravite|commentaire)-risque-specifique-',
    );

    axios.post(`/api/homologation/${identifiantHomologation}/risques`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
