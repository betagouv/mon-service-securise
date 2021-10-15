import brancheAjoutItem from '../modules/saisieListeItems.js';
import { parametresAvecItemsExtraits } from '../modules/parametres.js';
import texteHTML from '../modules/texteHTML.js';

$(() => {
  let indexMaxRisquesSpecifiques = 0;

  const ajouteInformationsModales = () => {
    $('.information').click((eInformation) => {
      $('body').css('overflow', 'hidden');
      $('.rideau', $(eInformation.target)).css('display', 'flex');

      $('.fermeture-modale', $(eInformation.target)).click((eFermeture) => {
        eFermeture.stopPropagation();
        $('.rideau', $(eInformation.target)).css('display', '');
        $('body').css('overflow', '');
      });
    });
  };

  const ajouteZoneSaisieCommentairePourRisque = ($r, nom) => {
    const $lien = $('a', $r);
    const $zoneSaisie = $(`<textarea id=${nom} name=${nom}></textarea>`);
    $zoneSaisie.hide();
    $lien.click(() => $zoneSaisie.toggle());

    $zoneSaisie.appendTo($r);
  };

  const peupleCommentairesAvec = (selecteurDonnees) => {
    const donneesRisques = JSON.parse($(selecteurDonnees).text());
    donneesRisques.risquesGeneraux.forEach(({ id, commentaire }) => {
      if (commentaire) $(`#commentaire-${id}`).show().val(texteHTML(commentaire));
    });
  };

  const zoneSaisieRisqueSpecifique = (index) => `
<input id="description-risque-specifique-${index}"
     name="description-risque-specifique-${index}"
     placeholder="Description du risque"
     value="">
<textarea id="commentaire-risque-specifique-${index}"
        name="commentaire-risque-specifique-${index}"
        placeholder="Commentaires additionnels (facultatifs)"></textarea>
  `;

  const brancheAjoutRisqueSpecifique = (...params) => brancheAjoutItem(
    ...params,
    (index) => zoneSaisieRisqueSpecifique(index),
    () => (indexMaxRisquesSpecifiques += 1),
  );

  ajouteInformationsModales();
  $('.risque').each((_, $r) => ajouteZoneSaisieCommentairePourRisque($r, `commentaire-${$r.id}`));
  peupleCommentairesAvec('#donnees-risques');

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  brancheAjoutRisqueSpecifique('.nouvel-item', '#risques-specifiques');

  $bouton.click(() => {
    const params = parametresAvecItemsExtraits(
      'form#risques',
      'risquesSpecifiques',
      '^(description|commentaire)-risque-specifique-',
    );

    axios.post(`/api/homologation/${identifiantHomologation}/risques`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
