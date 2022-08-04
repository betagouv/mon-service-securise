import { controleChampsRequis, tousChampsRequisRemplis } from './champsRequis.mjs';

const brancheSoumissionFormulaireUtilisateur = ($formulaire, action) => {
  const reponseOuiNon = (nom) => {
    const valeur = $(`input[name="${nom}"]:checked`).val();
    switch (valeur) {
      case 'oui': return true;
      case 'non': return false;
      default: return undefined;
    }
  };

  const reponseAcceptee = (nom) => ($(`#${nom}:checked`).val() ? true : undefined);

  const obtentionDonnees = {
    prenom: () => $('#prenom').val(),
    nom: () => $('#nom').val(),
    email: () => $('#email').val(),
    telephone: () => $('#telephone').val(),
    rssi: () => reponseOuiNon('rssi'),
    delegueProtectionDonnees: () => reponseOuiNon('delegueProtectionDonnees'),
    poste: () => $('#poste').val(),
    nomEntitePublique: () => $('#nomEntitePublique').val(),
    departementEntitePublique: () => $('#departementEntitePublique').val(),
    motDePasse: () => $('#mot-de-passe').val(),
    cguAcceptees: () => reponseAcceptee('cguAcceptees'),
  };

  $formulaire.on('submit', (evenement) => {
    evenement.preventDefault();

    controleChampsRequis(obtentionDonnees);
    if (tousChampsRequisRemplis(obtentionDonnees)) {
      const donnees = Object
        .keys(obtentionDonnees)
        .reduce((acc, clef) => {
          const valeur = obtentionDonnees[clef]();
          if (typeof valeur === 'undefined' || valeur === '') {
            return acc;
          }
          return { ...acc, [clef]: obtentionDonnees[clef]() };
        }, {});
      action(donnees);
    }
  });
};

export default brancheSoumissionFormulaireUtilisateur;
