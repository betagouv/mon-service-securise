import tableauDesServices from './tableauDesServices.mjs';

const contenuActions = {
  duplication: {
    titre: 'Dupliquer',
    texte: 'Copier autant de fois que nécessaire les services sélectionnés. Toutes les données saisies apparaîtront dans les nouveaux services créés, hormis celles de la rubrique Homologuer.',
    initialise: () => {
      $('#nombre-copie').val(1);
    },
  },
  export: {
    titre: 'Exporter la sélection',
    texte: "Récupérer l'essentiel des données du tableau de bord pour les services sélectionnés.",
    initialise: () => { },
  },
  invitation: {
    titre: 'Inviter des contributeurs 1/2',
    texte: 'Créer des équipes de travail avec autant de personnes souhaitées.',
    initialise: () => {
      $('#email-invitation-collaboration').val('');
    },
  },
  'invitation-confirmation': {
    titre: 'Inviter des contributeurs 2/2',
    texte: 'Créer des équipes de travail avec autant de personnes souhaitées.',
    initialise: () => { },
  },
  suppression: {
    titre: 'Supprimer',
    texte: 'Effacer toutes les données saisies et tous les résultats proposés par MonServiceSécurisé pour les services sélectionnés. Seuls les propriétaires peuvent supprimer.',
    initialise: () => {
      const { nomDuService, servicesSelectionnes } = tableauDesServices;
      const nbServicesSelectionnes = servicesSelectionnes.size;
      if (nbServicesSelectionnes === 1) {
        const idSelectionne = servicesSelectionnes.keys().next().value;
        $('#nombre-service-suppression').html(`le service <strong>${(nomDuService(idSelectionne))}</strong> `);
      } else {
        $('#nombre-service-suppression').html(`<strong>les ${nbServicesSelectionnes} services sélectionnés</strong> `);
      }
    },
  },
};

const gestionnaireTiroir = {
  afficheContenuAction: (identifiantAction) => {
    const { titre, texte, initialise } = contenuActions[identifiantAction];
    $('.titre-tiroir').text(titre);
    $('.texte-tiroir').text(texte);
    $('.bloc-contenu').hide();
    $(`#contenu-${identifiantAction}`).show();
    initialise();
    gestionnaireTiroir.basculeOuvert(true);
  },
  basculeOuvert: (statut) => {
    if (statut) $('.tiroir').addClass('ouvert');
    else $('.tiroir').removeClass('ouvert');
  },
};

export default gestionnaireTiroir;
