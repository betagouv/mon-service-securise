import { brancheValidation, declencheValidation } from './validation.mjs';

const basculeAffichageInformationsComplementaireAutrePoste = (doitAfficher) => {
  $('#info-complementaire-poste-autre').toggleClass('invisible', !doitAfficher);
  $('#posteAutre').toggleClass('invisible', !doitAfficher);
};

const brancheValidationPoste = (selecteurFormulaire) => {
  const $conteneur = $('.fonction-poste', selecteurFormulaire);
  const $toutesCasesACocher = $('input:checkbox', $conteneur);
  const $champSaisieAutre = $('#posteAutre', $conteneur);

  const verifieEtatCasesACocher = () => {
    const $casesCochees = $toutesCasesACocher.filter(':checked');
    const $caseAutreCochee = $casesCochees.filter('#posteAutrePresent');
    const valeurChampSaisieAutre = $champSaisieAutre.val();

    const messageErreur =
      $casesCochees.length === 0 ||
      ($caseAutreCochee.length === 1 && !valeurChampSaisieAutre)
        ? 'Erreur de saisie'
        : '';
    $toutesCasesACocher.each((_, caseACocher) => {
      caseACocher.setCustomValidity(messageErreur);
      caseACocher.reportValidity();
    });
  };

  verifieEtatCasesACocher();
  $toutesCasesACocher.on('change', () => verifieEtatCasesACocher());
  $champSaisieAutre.on('input', () => verifieEtatCasesACocher());
};

const brancheSoumissionFormulaireUtilisateur = (
  selecteurFormulaire,
  action
) => {
  const reponseAcceptee = (nom) =>
    $(`#${nom}:checked`).val() ? true : undefined;

  const obtentionDonnees = {
    prenom: () => $('#prenom').val(),
    nom: () => $('#nom').val(),
    email: () => $('#email').val(),
    telephone: () => $('#telephone').val(),
    nomEntitePublique: () => $('#nomEntitePublique').val(),
    departementEntitePublique: () => $('#departementEntitePublique').val(),
    motDePasse: () => $('#mot-de-passe').val(),
    cguAcceptees: () => reponseAcceptee('cguAcceptees'),
    infolettreAcceptee: () => $('#infolettreAcceptee').is(':checked'),
    postes: () => {
      const postes = [
        ...($('#posteRSSI').is(':checked') ? ['RSSI'] : []),
        ...($('#posteDPO').is(':checked') ? ['DPO'] : []),
        ...($('#posteDSI').is(':checked') ? ['DSI'] : []),
        ...($('#posteAutrePresent').is(':checked')
          ? [$('#posteAutre').val()]
          : []),
      ];
      return [...new Set(postes)];
    },
  };

  brancheValidation(selecteurFormulaire);
  $(`${selecteurFormulaire} button[type = 'submit']`).on('click', () => {
    declencheValidation(selecteurFormulaire);
  });

  $(selecteurFormulaire).on('submit', (evenement) => {
    evenement.preventDefault();

    const donnees = Object.keys(obtentionDonnees).reduce((acc, clef) => {
      const valeur = obtentionDonnees[clef]();
      if (typeof valeur === 'undefined' || valeur === '') {
        return acc;
      }
      return { ...acc, [clef]: obtentionDonnees[clef]() };
    }, {});

    action(donnees);
  });

  $('#posteAutrePresent', selecteurFormulaire).on('change', (evenement) => {
    const $element = $(evenement.target);
    const doitCacherInformations = !$element.is(':checked');

    basculeAffichageInformationsComplementaireAutrePoste(
      !doitCacherInformations
    );

    if (doitCacherInformations) $('#posteAutre').val('');
  });

  basculeAffichageInformationsComplementaireAutrePoste(
    $('#posteAutrePresent').is(':checked')
  );

  brancheValidationPoste(selecteurFormulaire);
};

export default brancheSoumissionFormulaireUtilisateur;
