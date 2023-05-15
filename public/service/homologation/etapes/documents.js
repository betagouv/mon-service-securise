import brancheComportemenFormulaireEtape from '../formulaireEtape.js';

const estValeurAvecDocuments = (valeur) => valeur === '1';

const montreListeDocuments = ($element) => {
  const avecDocuments = estValeurAvecDocuments($element.val());

  if (avecDocuments) {
    $('#documents').removeClass('invisible');
    $('#au-moins-un-document').attr('required', 'true');
  } else {
    $('#liste-documents').empty();
    $('#documents').addClass('invisible');
    $('#au-moins-un-document').removeAttr('required').val('');
  }
};

const brancheBoutonsRadio = () => {
  const $conteneurRadioBouton = $('fieldset#avecDocuments');
  const $radioDocumentsSelectionne = $(
    'input:radio:checked',
    'fieldset#avecDocuments'
  );
  montreListeDocuments($radioDocumentsSelectionne);

  $conteneurRadioBouton.on('change', (e) => {
    montreListeDocuments($(e.target));
  });
};

const brancheBoutonSupprimer = ($element) => {
  $element.on('click', (e) => {
    const $listeDocuments = $('#liste-documents');
    const $auMoinsUnDocument = $('#au-moins-un-document');
    $(e.target).parent().remove();
    if ($listeDocuments.children().length === 0) {
      $auMoinsUnDocument.val('');
    }
  });
};

const brancheBoutonAjoutDocument = () => {
  const $boutonAjoutDocument = $('#ajout-document');
  const $champTitreDocument = $('#champ-titre-document');
  const $listeDocuments = $('#liste-documents');
  const $auMoinsUnDocument = $('#au-moins-un-document');

  $boutonAjoutDocument.on('click', () => {
    const titreDocument = $champTitreDocument.val().trim();
    if (titreDocument) {
      const $elementListe = $('<li></li>')
        .addClass('element-document')
        .attr('data-document', titreDocument);
      const $paragraphe = $('<div class="contenu"></div>').text(titreDocument);

      const $boutonSupprimer = $('<div class="bouton-supprimer"></div>');
      brancheBoutonSupprimer($boutonSupprimer);

      $elementListe.append($paragraphe).append($boutonSupprimer);
      $listeDocuments.append($elementListe);
      $champTitreDocument.val('');
      $auMoinsUnDocument.val('OK');
    }
  });
};

const brancheToucheEntree = () => {
  const $boutonAjoutDocument = $('#ajout-document');
  const $champTitreDocument = $('#champ-titre-document');

  $champTitreDocument.on('keypress', (evenement) => {
    if (evenement.key === 'Enter') {
      $boutonAjoutDocument.trigger('click');
      evenement.preventDefault();
    }
  });
};

const soumissionEtapeDocuments = (selecteurFormulaire) => (idService) => {
  const $radioDocumentsSelectionne = $(
    'input:radio:checked',
    'fieldset#avecDocuments'
  );
  const avecDocuments = estValeurAvecDocuments(
    $radioDocumentsSelectionne.val()
  );
  const documents = $('.element-document', selecteurFormulaire)
    .toArray()
    .map((element) => $(element).attr('data-document'));

  return axios.put(`/api/service/${idService}/homologation/documents`, {
    documents,
    avecDocuments,
  });
};

$(() => {
  brancheBoutonsRadio();
  brancheBoutonAjoutDocument();
  brancheToucheEntree();
  $('.bouton-supprimer').each((_, bouton) => brancheBoutonSupprimer($(bouton)));
  brancheComportemenFormulaireEtape(soumissionEtapeDocuments('form'));
});
