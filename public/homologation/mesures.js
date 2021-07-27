import parametres from '../modules/parametres.js';

const filtreMesures = (selecteurMesures, categorieFiltre) => {
  const referentielMesures = JSON.parse($('#referentielMesures').text());
  Object.keys(referentielMesures)
    .forEach((id) => $(`fieldset#${id}`).toggle(
      (!categorieFiltre) || categorieFiltre === referentielMesures[id].categorie
    ));
};

const brancheFiltres = (selecteurFiltres, selecteurMesures) => {
  const $filtres = $(selecteurFiltres);
  $filtres.each((_, f) => {
    $(f).click((e) => {
      $('.actif').removeClass('actif');
      $(e.target).addClass('actif');

      const idCategorie = e.target.id;
      filtreMesures(selecteurMesures, idCategorie);
    });
  });
};

const $conteneurModalites = (nom) => {
  const $conteneur = $('<div></div>');
  const $lien = $('<a class="informations-additionnelles" href="#">Précisez les modalités de mise en œuvre (facultatif)</a>');
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
  brancheFiltres('form#mesures nav > a', '.mesures');

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
