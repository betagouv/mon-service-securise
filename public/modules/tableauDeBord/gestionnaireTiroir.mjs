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
    estProprietaire ? 'Propriétaire' : 'Contributeur'
  }</div>
  </li>`;

const contenuActions = {
  contributeurs: {
    titre: 'Contributeurs',
    texteSimple:
      'Gérer la liste des personnes invitées à contribuer au service sélectionné.',
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
    texteSimple:
      "Créer une ou plusieurs copies du services sélectionné. Cette copie n'inclut pas les données concernant son homologation.",
    initialise: () => {
      $('#nombre-copie').val(1);
    },
  },
  export: {
    titre: 'Exporter la sélection',
    texteSimple:
      'Télécharger les données du service sélectionné dans le tableau de bord.',
    texteMultiple:
      'Télécharger la liste des services sélectionnés dans le tableau de bord.',
    initialise: () => {},
  },
  invitation: {
    titre: 'Inviter des contributeurs 1/2',
    texteSimple:
      'Inviter les personnes de votre choix à contribuer à ce service.',
    texteMultiple:
      'Inviter les personnes de votre choix à contribuer à ces services.',
    initialise: () => {
      $('#email-invitation-collaboration').val('');
    },
  },
  'invitation-confirmation': {
    titre: 'Inviter des contributeurs 2/2',
    texteSimple:
      'Inviter les personnes de votre choix à contribuer à ce service.',
    texteMultiple:
      'Inviter les personnes de votre choix à contribuer à ces services.',
    initialise: () => {},
  },
  suppression: {
    titre: 'Supprimer',
    texteSimple: 'Effacer toutes les données du service sélectionné.',
    texteMultiple: 'Effacer toutes les données des services sélectionnés.',
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
    titre: 'Télécharger les PDFs',
    texteSimple:
      "Obtenir les documents utiles à la sécurisation et à l'homologation du service sélectionné.",
    texteMultiple:
      "Obtenir les documents utiles à la sécurisation et à l'homologation des services sélectionnés.",
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
    const { titre, texteSimple, texteMultiple, initialise } =
      contenuActions[identifiantAction];
    const estSelectionMulitple =
      tableauDesServices.servicesSelectionnes.size > 1;
    $('.titre-tiroir').text(titre);
    $('.texte-tiroir').text(estSelectionMulitple ? texteMultiple : texteSimple);
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
