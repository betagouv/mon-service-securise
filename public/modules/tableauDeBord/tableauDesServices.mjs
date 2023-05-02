const [AUCUNE, ASC] = [0, 1];
const STATUS_HOMOLOGATION = {
  aSaisir: 'À réaliser',
  aCompleter: 'À finaliser',
  completes: 'Réalisée',
};

const metEnFormeContributeurs = (service) => [service.createur.prenomNom, ...service.contributeurs.map((c) => c.prenomNom)].join('\n');
const remplisCartesInformations = (resume) => {
  $('#nombre-services').text(resume.nombreServices);
  $('#nombre-services-homologues').text(resume.nombreServicesHomologues);
  $('#indice-cyber-moyen').text(resume.indiceCyberMoyen?.toFixed(1) ?? '-');
};

const tableauDesServices = {
  $tableau: $('.contenu-tableau-services'),
  donnees: [],
  nombreServices: 0,
  servicesSelectionnes: new Set(),
  termeRecherche: '',
  tri: { colonne: null, direction: AUCUNE },
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
  afficheEtatSelection: () => {
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
  basculeSelectionService: (idService, statut) => {
    if (statut) {
      tableauDesServices.servicesSelectionnes.add(idService);
      $(`.ligne-service[data-id-service='${idService}']`).addClass('selectionne');
    } else {
      tableauDesServices.servicesSelectionnes.delete(idService);
      $(`.ligne-service[data-id-service='${idService}']`).removeClass('selectionne');
    }
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
  nomDuService: (idService) => tableauDesServices
    .donnees
    .find((service) => service.id === idService)
    ?.nomService,
  recupereServices: () => {
    axios.get('/api/utilisateurCourant')
      .then(() => axios.get('/api/services')
        .then(({ data }) => {
          remplisCartesInformations(data.resume);
          tableauDesServices.nombreServices = data.resume.nombreServices;
          tableauDesServices.donnees = data.services;
          tableauDesServices.afficheDonnees();
        }));
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
      const $celluleCollaborateur = $('<td></td>');
      const $conteneurCollaborateur = $(`<div class='conteneur-collaborateur ${service.estCreateur ? 'createur' : ''}'></div>`);
      const $nombreContributeurs = $(`<div class='contributeurs' title='${metEnFormeContributeurs(service)}'>${service.nombreContributeurs}</div>`);
      $conteneurCollaborateur.append($nombreContributeurs);
      $celluleCollaborateur.append($conteneurCollaborateur);
      $ligne.append($celluleCollaborateur);
      $ligne.append($(`<td>${parseFloat(service.indiceCyber) === 0 ? '-' : service.indiceCyber}</td>`));
      $ligne.append($(`<td><div class='statut-homologation statut-${service.statutHomologation}'>${STATUS_HOMOLOGATION[service.statutHomologation]}</div></td>`));

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

export default tableauDesServices;
