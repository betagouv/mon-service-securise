import parametres from '../modules/parametres.js';
import texteHTML from '../modules/texteHTML.js';

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
  donneesRisques.risques.forEach(({ id, commentaire }) => {
    if (commentaire) $(`#commentaire-${id}`).show().val(texteHTML(commentaire));
  });
};

$(() => {
  ajouteInformationsModales();
  $('.risque').each((_, $r) => ajouteZoneSaisieCommentairePourRisque($r, `commentaire-${$r.id}`));
  peupleCommentairesAvec('#donnees-risques');

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#risques');
    axios.post(`/api/homologation/${identifiantHomologation}/risques`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
