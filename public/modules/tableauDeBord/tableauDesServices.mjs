const ORDRE_DE_TRI = {
  AUCUN: 0,
  ASC: 1,
  DESC: 2,
  suivant: (actuel) => (actuel + 1) % 3,
  depuisString: (valeur) => {
    const ordre = parseInt(valeur, 10);
    return Number.isNaN(ordre) ? ORDRE_DE_TRI.AUCUN : ordre;
  },
};

const metEnFormeContributeurs = (service) =>
  [
    service.createur.prenomNom,
    ...service.contributeurs.map((c) => c.prenomNom),
  ].join('\n');
const remplisCartesInformations = (resume) => {
  $('#nombre-services').text(resume.nombreServices);
  $('#nombre-services-homologues').text(resume.nombreServicesHomologues);
};
const remplisCarteInformationIndiceCyber = (indiceCyberMoyen) => {
  $('#indice-cyber-moyen').text(indiceCyberMoyen);
};

const tableauDesServices = {
  $tableau: $('.contenu-tableau-services'),
  donnees: [],
  donneesAffichees: [],
  nombreServices: 0,
  servicesSelectionnes: new Set(),
  termeRecherche: '',
  tri: { colonne: null, ordre: ORDRE_DE_TRI.AUCUN },
  filtre: { seulementProprietaire: false },
  afficheDonnees: () => {
    tableauDesServices.videTableau();
    tableauDesServices.filtreEtTriDonnees();
    tableauDesServices.remplisTableau();
  },
  afficheEtatSelection: () => {
    const nbServiceSelectionnes = tableauDesServices.servicesSelectionnes.size;
    const $checkboxTousServices = $('.checkbox-selection-tous-services');
    const $barreOutils = $('#barre-outils');
    const $raccourciTous = $('.conteneur-tous-selection');
    const $checkboxRaccourciTous = $('.checkbox-tous-services');
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
      $('.texte-nombre-service').text(
        `${nbServiceSelectionnes} sélectionné${
          nbServiceSelectionnes > 1 ? 's' : ''
        }`
      );
    }
    if (nbServiceSelectionnes > 0) {
      $barreOutils.addClass('visible');
      $raccourciTous.fadeOut(200);
    } else {
      $barreOutils.removeClass('visible');
      $checkboxRaccourciTous.prop('checked', false);
      $raccourciTous.fadeIn(200);
    }
  },
  appliqueTriContributeurs: (ordre, filtreEstProprietaire) => {
    tableauDesServices.tri = { colonne: 'nombreContributeurs', ordre };
    tableauDesServices.filtre.seulementProprietaire = filtreEstProprietaire;
    tableauDesServices.afficheDonnees();
    $('.tableau-services thead th.triable').attr('data-ordre', 0);
  },
  basculeSelectionService: (idService, statut) => {
    if (statut) {
      tableauDesServices.servicesSelectionnes.add(idService);
      $(`.ligne-service[data-id-service='${idService}']`).addClass(
        'selectionne'
      );
    } else {
      tableauDesServices.servicesSelectionnes.delete(idService);
      $(`.ligne-service[data-id-service='${idService}']`).removeClass(
        'selectionne'
      );
    }
  },
  modifieRecherche: (terme) => {
    tableauDesServices.termeRecherche = terme;
    tableauDesServices.afficheDonnees();
  },
  modifieTri: (colonne) => {
    const { colonne: colonneActuelle, ordre: ordreActuel } =
      tableauDesServices.tri;
    let ordre = ORDRE_DE_TRI.ASC;
    if (colonne === colonneActuelle) {
      ordre = ORDRE_DE_TRI.suivant(ordreActuel);
    }
    tableauDesServices.tri = { colonne, ordre };
    tableauDesServices.afficheDonnees();

    $('input[name="tri-contributeur"]').prop('checked', false);
    $('.tableau-services thead th.entete-contributeurs').attr('data-ordre', 0);

    $('.tableau-services thead th.triable').attr('data-ordre', 0);
    $(`.tableau-services thead th[data-colonne="${colonne}"]`).attr(
      'data-ordre',
      ordre
    );
  },
  donneesDuService: (idService) =>
    tableauDesServices.donnees.find((service) => service.id === idService),
  effaceSelection: () => {
    tableauDesServices.servicesSelectionnes.clear();
    tableauDesServices.afficheEtatSelection();
    tableauDesServices.afficheDonnees();
  },
  filtreEtTriDonnees() {
    tableauDesServices.donneesAffichees = tableauDesServices.donnees
      .filter(
        (service) =>
          tableauDesServices.termeRecherche === '' ||
          service.nomService
            .toLowerCase()
            .includes(tableauDesServices.termeRecherche.toLowerCase()) ||
          service.organisationsResponsables[0]
            ?.toLowerCase()
            .includes(tableauDesServices.termeRecherche.toLowerCase())
      )
      .filter((service) =>
        tableauDesServices.filtre.seulementProprietaire
          ? service.estCreateur
          : true
      )
      .sort((serviceA, serviceB) => {
        const { colonne, ordre } = tableauDesServices.tri;
        if (colonne === null) return 0;
        if (ordre === ORDRE_DE_TRI.AUCUN) return 0;
        if (ordre === ORDRE_DE_TRI.ASC)
          return serviceB[colonne] - serviceA[colonne];
        return serviceA[colonne] - serviceB[colonne];
      });
  },
  nomDuService: (idService) =>
    tableauDesServices.donneesDuService(idService)?.nomService,
  recupereServices: () => {
    axios.get('/api/utilisateurCourant').then(() =>
      axios
        .get('/api/services')
        .then(({ data }) => {
          remplisCartesInformations(data.resume);
          tableauDesServices.nombreServices = data.resume.nombreServices;
          tableauDesServices.donnees = data.services;
          tableauDesServices.afficheDonnees();
          tableauDesServices.afficheEtatSelection();
        })
        .then(() => axios.get('/api/services/indices-cyber'))
        .then(({ data }) => {
          remplisCarteInformationIndiceCyber(data.resume.indiceCyberMoyen);
          data.services.forEach((service) => {
            const cible = tableauDesServices.donnees.find(
              (donneesService) => donneesService.id === service.id
            );
            cible.indiceCyber = service.indiceCyber;
          });
          tableauDesServices.afficheDonnees();
        })
    );
  },
  remplisTableau: () => {
    if (tableauDesServices.donneesAffichees.length === 0) {
      tableauDesServices.$tableau.append(`
      <tr>
        <td colspan='5'>
          Aucun service ne correspond à la recherche.
        </td>
      </tr>
      `);
      return;
    }

    tableauDesServices.donneesAffichees.forEach((service) => {
      const estSelectionne = tableauDesServices.servicesSelectionnes.has(
        service.id
      );
      const $ligne = $(
        `<tr class='ligne-service ${
          estSelectionne ? 'selectionne' : ''
        }' data-id-service='${service.id}'></tr>`
      );
      const $celluleNoms = $("<td class='cellule-noms'></td>");
      const $inputSelection = $(
        "<input class='selection-service' type='checkbox' >"
      );
      $inputSelection.prop('checked', estSelectionne);
      const $nomService =
        $(`<a class='conteneur-noms' href='/service/${service.id}'>
                              <div class='nom-service'>${service.nomService}</div>
                              <div class='nom-organisation'>${service.organisationsResponsables[0]}</div>
                            </a>`);
      $celluleNoms.append($inputSelection);
      $celluleNoms.append($nomService);
      $ligne.append($celluleNoms);
      const $celluleCollaborateur = $('<td></td>');
      const $conteneurCollaborateur = $(
        `<div class='conteneur-contributeur ${
          service.estCreateur ? 'createur' : ''
        }' title='${
          service.estCreateur ? 'Service dont je suis propriétaire' : ''
        }'></div>`
      );
      const $nombreContributeurs = $(
        `<div class='contributeurs' title='${metEnFormeContributeurs(
          service
        )}' data-action='contributeurs'>${service.nombreContributeurs}</div>`
      );
      $conteneurCollaborateur.append($nombreContributeurs);
      $celluleCollaborateur.append($conteneurCollaborateur);
      $ligne.append($celluleCollaborateur);

      let contenuIndiceCyber = `${service.indiceCyber}<span class='note-totale'>/5</span>`;
      if (parseFloat(service.indiceCyber) === 0) {
        contenuIndiceCyber = '-';
      } else if (!service.indiceCyber) {
        contenuIndiceCyber = '<div class="icone-chargement"></div>';
      }
      $ligne.append(
        $(`<td class="cellule-indice-cyber">${contenuIndiceCyber}</td>`)
      );
      $ligne.append(
        $(
          `<td><div class='statut-homologation statut-${service.statutHomologation.id}'>${service.statutHomologation.libelle}</div></td>`
        )
      );

      const $boutonLienSynthese = $(
        `<a class='action-lien action-lien-synthese' href='/service/${service.id}'><img src='/statique/assets/images/forme_chevron_bleu.svg'></a>`
      );
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
export { ORDRE_DE_TRI };
