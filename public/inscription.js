import { controleChampsRequis, tousChampsRequisRemplis } from './modules/interactions/champsRequis.mjs';

$(() => {
  const brancheMiseEnAvantSaisie = () => $("input[type!='radio'][type!='checkbox'], select")
    .on('change', (evenement) => $(evenement.target).toggleClass('champ-saisi', evenement.target.value !== ''));

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
    cguAcceptees: () => reponseAcceptee('cguAcceptees'),
  };

  const $formulaire = $('form#inscription');

  brancheMiseEnAvantSaisie();
  $formulaire.on('submit', (evenement) => {
    evenement.preventDefault();
    controleChampsRequis(obtentionDonnees);
    if (tousChampsRequisRemplis(obtentionDonnees)) {
      const donnees = Object
        .keys(obtentionDonnees)
        .reduce((acc, clef) => ({ ...acc, [clef]: obtentionDonnees[clef]() }), {});
      axios.post('/api/utilisateur', donnees).then(() => (window.location = '/activation'));
    }
  });
});
