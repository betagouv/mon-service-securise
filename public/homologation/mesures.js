import parametres from '../modules/parametres.js';

const $conteneurModalites = (nom) => {
  const $conteneur = $('<div></div>');
  const $lien = $('<a class="modalites" href="#">Précisez les modalités de mise en œuvre (facultatif)</a>');
  const $zoneSaisie = $(`<textarea id=${nom} name=${nom}></textarea>`);
  $zoneSaisie.hide();

  $lien.click(() => $zoneSaisie.toggle());

  $conteneur.append($lien, $zoneSaisie);
  return $conteneur;
};

const ajouteConteneursModalites = () => $('fieldset').each((_, $f) => {
  const nom = `modalites-${$('input', $f)[0].name}`;
  const $modalites = $conteneurModalites(nom);
  $modalites.appendTo($f);
});

const peupleFormulaire = () => {
  const donneesMesures = JSON.parse($('#donneesMesures').text());
  donneesMesures.forEach(({ id, statut, modalites }) => {
    $(`#${id}-${statut}`).prop('checked', true);
    if (modalites) $(`#modalites-${id}`).show().val(modalites);
  });
};

$(() => {
  ajouteConteneursModalites();
  peupleFormulaire();

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#mesures');
    axios.post(`/api/homologation/${identifiantHomologation}/mesures`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
