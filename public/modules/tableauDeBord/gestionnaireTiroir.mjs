import tableauDesServices from './tableauDesServices.mjs';

const EVENEMENT_BASCULE_TIROIR = 'basculeTiroir';

const contenuActions = {
  duplication: {
    titre: 'Dupliquer',
    texte:
      'Copier autant de fois que nécessaire les services sélectionnés. Toutes les données saisies apparaîtront dans les nouveaux services créés, hormis celles de la rubrique Homologuer.',
    initialise: () => {
      $('#nombre-copie').val(1);
    },
  },
  export: {
    titre: 'Exporter la sélection',
    texte:
      "Récupérer l'essentiel des données du tableau de bord pour les services sélectionnés.",
    initialise: () => {},
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
    initialise: () => {},
  },
  suppression: {
    titre: 'Supprimer',
    texte:
      'Effacer toutes les données saisies et tous les résultats proposés par MonServiceSécurisé pour les services sélectionnés. Seuls les propriétaires peuvent supprimer.',
    initialise: () => {
      const { nomDuService, servicesSelectionnes } = tableauDesServices;
      const nbServicesSelectionnes = servicesSelectionnes.size;
      if (nbServicesSelectionnes === 1) {
        const idSelectionne = servicesSelectionnes.keys().next().value;
        $('#nombre-service-suppression').html(
          `le service <strong>${nomDuService(idSelectionne)}</strong> `
        );
      } else {
        $('#nombre-service-suppression').html(
          `<strong>les ${nbServicesSelectionnes} services sélectionnés</strong> `
        );
      }
    },
  },
  telechargement: {
    titre: 'Télécharger PDF(s)',
    texte:
      'Obtenir en un clic les documents indispensables pour sécuriser et homologuer le service sélectionné.',
    initialise: () => {
      const idSelectionne = tableauDesServices.servicesSelectionnes
        .keys()
        .next().value;
      const urlBase = `/api/service/${idSelectionne}/pdf/`;
      $('#lien-synthese').attr('href', `${urlBase}syntheseSecurite.pdf`);
      $('#lien-annexes').attr('href', `${urlBase}annexes.pdf`);
      $('#lien-decision').attr('href', `${urlBase}dossierDecision.pdf`);
      $('#lien-archive').attr('href', `${urlBase}documentsHomologation.zip`);

      const donneesService = tableauDesServices.donneesDuService(idSelectionne);

      const $conteneurDuDisponible = $('#conteneur-lien-decision');
      const $conteneurDeIndisponible = $(
        '#conteneur-lien-decision-indisponible'
      );
      if (donneesService.documentsPdfDisponibles.includes('dossierDecision')) {
        $conteneurDuDisponible.show();
        $conteneurDeIndisponible.hide();
      } else {
        $conteneurDuDisponible.hide();
        $conteneurDeIndisponible.show();
      }

      $('#nbPdfDisponibles', '#conteneur-lien-archive').text(
        donneesService.documentsPdfDisponibles.length
      );
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
    $(document).trigger(EVENEMENT_BASCULE_TIROIR, { ouvert: statut });
  },
};

export { gestionnaireTiroir, EVENEMENT_BASCULE_TIROIR };
