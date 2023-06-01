import tableauDesServices from './tableauDesServices.mjs';

const EVENEMENT_BASCULE_TIROIR = 'basculeTiroir';

const metEnFormeContributeur = (contributeur, estProprietaire) =>
  `<li>
    <div class='contenu-nom-prenom'>
      <div class='initiale ${
        estProprietaire ? 'proprietaire' : 'contributeur'
      }'>${contributeur.initiales}</div>
      <div class='nom-prenom-poste'>
        <div class='nom-contributeur'>${contributeur.prenomNom}</div>
        <div class='poste-contributeur'>${contributeur.poste || '…'}</div>
      </div>
    </div>
    <div class='role ${estProprietaire ? 'proprietaire' : 'contributeur'}'>${
    estProprietaire ? 'Propriétaire' : 'Collaborateur'
  }</div>
  </li>`;

const contenuActions = {
  contributeurs: {
    titre: 'Contributeurs',
    texte:
      "Découvrir l'équipe de travail du service pour sécuriser et homologuer à tout moment, même en simultané.",
    initialise: ([idService]) => {
      const service = tableauDesServices.donneesDuService(idService);
      const $listeContributeurs = $('#liste-contributeurs');

      $listeContributeurs.empty();
      $listeContributeurs.append(
        metEnFormeContributeur(service.createur, true)
      );
      service.contributeurs.forEach((contributeur) => {
        $listeContributeurs.append(metEnFormeContributeur(contributeur, false));
      });
    },
  },
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

      const $conteneurDecision = $('#conteneur-lien-decision');
      const dossierDecisionDisponible =
        donneesService.documentsPdfDisponibles.includes('dossierDecision');
      $('.lien-telechargement', $conteneurDecision).toggle(
        dossierDecisionDisponible
      );
      $('.lien-indisponible', $conteneurDecision).toggle(
        !dossierDecisionDisponible
      );

      $('#nbPdfDisponibles', '#conteneur-lien-archive').text(
        donneesService.documentsPdfDisponibles.length
      );
    },
  },
};

const gestionnaireTiroir = {
  afficheContenuAction: (identifiantAction, ...args) => {
    const { titre, texte, initialise } = contenuActions[identifiantAction];
    $('.titre-tiroir').text(titre);
    $('.texte-tiroir').text(texte);
    $('.bloc-contenu').hide();
    $(`#contenu-${identifiantAction}`).show();
    initialise(args);
    gestionnaireTiroir.basculeOuvert(true);
  },
  basculeOuvert: (doitOuvrir) => {
    if (doitOuvrir) $('.tiroir').addClass('ouvert');
    else {
      $('.tiroir').removeClass('ouvert');
      $('#barre-outils .action').removeClass('actif');
    }
    $(document).trigger(EVENEMENT_BASCULE_TIROIR, { ouvert: doitOuvrir });
  },
};

export { gestionnaireTiroir, EVENEMENT_BASCULE_TIROIR };
