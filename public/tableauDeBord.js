import { brancheModale } from './modules/interactions/modale.mjs';

const [AUCUNE, ASC] = [0, 1];
const STATUS_HOMOLOGATION = {
  aSaisir: 'À réaliser',
  aCompleter: 'À finaliser',
  completes: 'Réalisée',
};

const metEnFormeContributeurs = (service) => [service.createur.prenomNom, ...service.contributeurs.map((c) => c.prenomNom)].join('\n');

const tableauDesServices = {
  $tableau: $('.contenu-tableau-services'),
  donnees: [],
  nombreServices: 0,
  servicesSelectionnes: new Set(),
  termeRecherche: '',
  tri: {
    colonne: null,
    direction: AUCUNE,
  },
  afficheDonnees: () => {
    tableauDesServices.videTableau();
    const donneesAAfficher = tableauDesServices.donnees
      .filter((service) => (
        tableauDesServices.termeRecherche === ''
        || service.nomService
          .toLowerCase()
          .includes(tableauDesServices.termeRecherche.toLowerCase())
        || service.organisationsResponsables[0]
          ?.toLowerCase()
          .includes(tableauDesServices.termeRecherche.toLowerCase())))
      .sort((serviceA, serviceB) => {
        const { colonne, direction } = tableauDesServices.tri;
        if (colonne === null) return 0;
        if (direction === null) return 0;
        if (direction === ASC) return serviceB[colonne] - serviceA[colonne];
        return serviceA[colonne] - serviceB[colonne];
      });
    tableauDesServices.remplisTableau(donneesAAfficher);
  },
  basculeSelectionService: (idService, statut) => {
    if (statut) {
      tableauDesServices.servicesSelectionnes.add(idService);
      $(`.ligne-service[data-id-service='${idService}']`).addClass('selectionne');
    } else {
      tableauDesServices.servicesSelectionnes.delete(idService);
      $(`.ligne-service[data-id-service='${idService}']`).removeClass('selectionne');
    }
  },
  fixeDonnees: (donnees) => {
    tableauDesServices.donnees = donnees.map((d) => ({
      ...d,
      nombreContributeurs: d.contributeurs.length + 1,
    }));
  },
  modifieRecherche: (terme) => {
    tableauDesServices.termeRecherche = terme;
    tableauDesServices.afficheDonnees();
  },
  modifieTri: (colonne) => {
    const { colonne: colonneActuelle, direction: directionActuelle } = tableauDesServices.tri;
    let direction = ASC;
    if (colonne === colonneActuelle) {
      direction = (directionActuelle + 1) % 3;
    }
    tableauDesServices.tri = { colonne, direction };
    tableauDesServices.afficheDonnees();

    $('.tableau-services thead th').attr('data-direction', 0);
    $(`.tableau-services thead th[data-colonne="${colonne}"]`).attr('data-direction', direction);
  },
  remplisTableau: (donnees) => {
    donnees.forEach((service) => {
      const estSelectionne = tableauDesServices.servicesSelectionnes.has(service.id);
      const $ligne = $(`<tr class='ligne-service ${estSelectionne ? 'selectionne' : ''}' data-id-service='${service.id}'></tr>`);
      const $celluleNoms = $("<td class='cellule-noms'></td>");
      const $inputSelection = $("<input class='selection-service' type='checkbox' >");
      $inputSelection.prop('checked', estSelectionne);
      const $nomService = $(`<a class='conteneur-noms' href='/service/${service.id}'>
                              <div class='nom-service'>${service.nomService}</div>
                              <div class='nom-organisation'>${service.organisationsResponsables[0]}</div>
                            </a>`);
      $celluleNoms.append($inputSelection);
      $celluleNoms.append($nomService);
      $ligne.append($celluleNoms);
      $ligne.append($(`<td><div class='contributeurs' title='${metEnFormeContributeurs(service)}'>${service.nombreContributeurs}</div></td>`));
      $ligne.append($(`<td>${parseFloat(service.indiceCyber) === 0 ? '-' : service.indiceCyber}</td>`));
      $ligne.append($(`<td><div class='statut-homologation statut-${service.statutHomologation}'>${STATUS_HOMOLOGATION[service.statutHomologation]}</div></td>`));

      // Le menu flotant et son bouton sont mis de coté en attendant
      // que les maquettes Figma prennent en compte l'accés à la synthèse

      // eslint-disable-next-line no-unused-vars
      const $menuFlotant = $(`<div class='menu-flotant liens-services invisible'>
                                <a href='/service/${service.id}/descriptionService'>Décrire</a>
                                <a href='/service/${service.id}/mesures'>Sécuriser</a>
                                <a href='/service/${service.id}/dossiers'>Homologuer</a>
                                <hr>
                                <a href='/service/${service.id}/risques'>Risques</a>
                                <a href='/service/${service.id}/rolesResponsabilites'>Contacts utiles</a>
                              </div>`);
      // eslint-disable-next-line no-unused-vars
      const $boutonMenuFlotant = $("<div class='action-lien action-liens-services'><img src='/statique/assets/images/points_horizontal_bleu.svg'></div>");

      const $boutonLienSynthese = $(`<a class='action-lien action-lien-synthese' href='/service/${service.id}'><img src='/statique/assets/images/forme_chevron_bleu.svg'></a>`);
      const $celluleActions = $("<td class='cellule-actions'></td>");
      $celluleActions.append($boutonLienSynthese);
      $ligne.append($celluleActions);

      tableauDesServices.$tableau.append($ligne);
    });
  },
  videTableau: () => {
    tableauDesServices.$tableau.empty();
  },
};

const remplisCartesInformations = (resume) => {
  $('#nombre-services').text(resume.nombreServices);
  $('#nombre-services-homologues').text(resume.nombreServicesHomologues);
  $('#indice-cyber-moyen').text(resume.indiceCyberMoyen?.toFixed(1) ?? '-');
};

const gestionnaireEvenements = {
  gereMenuAction: ($bouton) => {
    const doitOuvrirMenu = !$bouton.parents('.conteneur-selection-services').hasClass('actif');
    gestionnaireEvenements.fermeToutMenuFlottant();
    if (doitOuvrirMenu) {
      $bouton.parents('.conteneur-selection-services').addClass('actif');
      $('.menu-flotant.actions-services').removeClass('invisible');
    } else {
      $bouton.parents('.conteneur-selection-services').removeClass('actif');
      $('.menu-flotant.actions-services').addClass('invisible');
    }
  },
  gereMenuFlotantLienService: ($bouton) => {
    const doitOuvrirMenu = !$bouton.hasClass('actif');
    gestionnaireEvenements.fermeToutMenuFlottant();
    if (doitOuvrirMenu) {
      const idService = $bouton.parents('.ligne-service').data('id-service');
      $bouton.addClass('actif');
      $(`.ligne-service[data-id-service='${idService}'] .menu-flotant.liens-services`).removeClass('invisible');
    }
  },
  gereSelectionService: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    const idService = $checkbox.parents('.ligne-service').data('id-service');
    tableauDesServices.basculeSelectionService(idService, selectionne);

    const nbServiceSelectionnes = tableauDesServices.servicesSelectionnes.size;
    const $checkboxTousServices = $('.checkbox-selection-tous-services');
    if (nbServiceSelectionnes === tableauDesServices.nombreServices) {
      $checkboxTousServices.removeClass('selection-partielle');
      $checkboxTousServices.prop('checked', true);
      $('.texte-nombre-service').text('Tous sélectionnés');
    } else if (nbServiceSelectionnes === 0) {
      $checkboxTousServices.removeClass('selection-partielle');
      $checkboxTousServices.prop('checked', false);
      $('.texte-nombre-service').text('0 sélectionné');
    } else {
      $checkboxTousServices.addClass('selection-partielle');
      $checkboxTousServices.prop('checked', false);
      $('.texte-nombre-service').text(`${nbServiceSelectionnes} sélectionné${nbServiceSelectionnes > 1 ? 's' : ''}`);
    }
  },
  gereSelectionTousServices: ($checkbox) => {
    const selectionne = $checkbox.is(':checked');
    $checkbox.removeClass('selection-partielle');

    $('.selection-service').each((_, input) => {
      const $checkboxService = $(input);
      tableauDesServices.basculeSelectionService($checkboxService.parents('.ligne-service').data('id-service'), selectionne);
      $checkboxService.prop('checked', selectionne);
    });
    $('.texte-nombre-service').text(selectionne ? 'Tous sélectionnés' : '0 sélectionné');
  },
  fermeToutMenuFlottant: () => {
    $('.action-lien').removeClass('actif');
    $('.conteneur-selection-services').removeClass('actif');
    $('.menu-flotant').addClass('invisible');
  },
};

$(() => {
  const afficheBandeauMajProfil = () => {
    $('.bandeau-maj-profil').removeClass('invisible');
  };

  brancheModale('#nouveau-service', '#modale-nouveau-service');

  axios.get('/api/utilisateurCourant')
    .then(({ data }) => data.utilisateur)
    .then((utilisateur) => {
      axios.get('/api/services')
        .then(({ data }) => {
          remplisCartesInformations(data.resume);
          tableauDesServices.nombreServices = data.resume.nombreServices;
          tableauDesServices.fixeDonnees(data.services);
          tableauDesServices.afficheDonnees();
        });

      if (!utilisateur.profilEstComplet) afficheBandeauMajProfil();
    });

  $('#recherche-service').on('input', (e) => {
    tableauDesServices.modifieRecherche($(e.target).val());
  });

  $('.tableau-services thead th:not(:first):not(:last)').on('click', (e) => {
    const colonne = $(e.target).data('colonne');
    tableauDesServices.modifieTri(colonne);
  });

  $('.tableau-services').on('click', (e) => {
    const $elementClique = $(e.target);
    if ($elementClique.hasClass('action-liens-services')) {
      gestionnaireEvenements.gereMenuFlotantLienService($elementClique);
    } else if ($elementClique.hasClass('selection-service')) {
      gestionnaireEvenements.gereSelectionService($elementClique);
    } else if ($elementClique.hasClass('checkbox-selection-tous-services')) {
      gestionnaireEvenements.gereSelectionTousServices($elementClique);
    } else if ($elementClique.hasClass('texte-nombre-service')) {
      gestionnaireEvenements.gereMenuAction($elementClique);
    } else {
      gestionnaireEvenements.fermeToutMenuFlottant();
    }
  });
});
