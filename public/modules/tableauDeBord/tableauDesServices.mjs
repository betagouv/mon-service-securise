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
  service.contributeurs.map((c) => c.prenomNom).join('\n');
const remplisCartesInformations = (resume) => {
  $('#nombre-services').text(resume.nombreServices);
  $('#nombre-services-homologues').text(resume.nombreServicesHomologues);
};
const remplisCarteInformationIndiceCyber = (indiceCyberMoyen) => {
  $('#indice-cyber-moyen').text(indiceCyberMoyen);
};

const etatVisiteGuidee = JSON.parse($('#etat-visite-guidee').text());
const visiteGuideeActive =
  etatVisiteGuidee.dejaTerminee === false && !etatVisiteGuidee.enPause;
const modeVisiteGuidee =
  visiteGuideeActive && etatVisiteGuidee.utilisateurCourant.profilComplet;
const donneesVisiteGuidee = {
  resume: {
    nombreServices: 1,
    nombreServicesHomologues: 0,
  },
  indiceCyber: 4.3,
  services: [
    {
      id: 'ID-SERVICE-VISITE-GUIDEE',
      nomService: 'MonServiceSécurisé',
      organisationResponsable: 'ANSSI',
      contributeurs: [],
      statutHomologation: {
        id: 'activee',
        enCoursEdition: false,
        libelle: 'Active',
        ordre: 5,
      },
      nombreContributeurs: 3,
      estProprietaire: true,
      documentsPdfDisponibles: ['annexes', 'syntheseSecurite'],
      permissions: {
        gestionContributeurs: true,
      },
    },
  ],
};

const tableauDesServices = {
  $tableau: $('.contenu-tableau-services'),
  donnees: [],
  donneesAffichees: [],
  estEnChargement: false,
  nombreServices: 0,
  servicesSelectionnes: new Set(),
  termeRecherche: '',
  tri: { colonne: null, ordre: ORDRE_DE_TRI.AUCUN },
  filtre: { seulementProprietaire: false },
  idServiceSelectionne: () =>
    tableauDesServices.servicesSelectionnes.keys().next().value,
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
    $('.tableau-services thead .triable').attr('data-ordre', 0);
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
    $('.tableau-services thead .bouton-contributeurs').attr('data-ordre', 0);

    $('.tableau-services thead .triable').attr('data-ordre', 0);
    $(`.tableau-services thead [data-colonne="${colonne}"]`).attr(
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
          service.organisationResponsable
            ?.toLowerCase()
            .includes(tableauDesServices.termeRecherche.toLowerCase())
      )
      .filter((service) =>
        tableauDesServices.filtre.seulementProprietaire
          ? service.estProprietaire
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
    if (modeVisiteGuidee) {
      remplisCartesInformations(donneesVisiteGuidee.resume);
      tableauDesServices.donnees = donneesVisiteGuidee.services;
      remplisCarteInformationIndiceCyber(donneesVisiteGuidee.indiceCyber);
      tableauDesServices.donnees[0].indiceCyber =
        donneesVisiteGuidee.indiceCyber;
      tableauDesServices.afficheDonnees();
      return;
    }
    tableauDesServices.estEnChargement = true;
    axios
      .get('/api/services')
      .then(({ data }) => {
        remplisCartesInformations(data.resume);
        tableauDesServices.nombreServices = data.resume.nombreServices;
        tableauDesServices.donnees = data.services;
        tableauDesServices.donnees.forEach((s) => {
          s.ordreStatutHomologation = s.statutHomologation?.ordre ?? -1;
        });
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
      })
      .finally(() => {
        tableauDesServices.estEnChargement = false;
        tableauDesServices.afficheDonnees();
      });
  },
  remplisTableau: () => {
    if (tableauDesServices.donneesAffichees.length === 0) {
      const aUneRechercheTextuelle =
        tableauDesServices.termeRecherche.length !== 0;
      const texteAAfficher = `Aucun service${
        aUneRechercheTextuelle ? ' ne correspond à la recherche' : ''
      }.`;
      tableauDesServices.$tableau.append(`
      <tr>
        <td colspan='5'>
          ${texteAAfficher}
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
        `<input class='selection-service' type='checkbox' aria-labelledby='nom-${service.id}'>`
      );
      $inputSelection.prop('checked', estSelectionne);
      const $nomService = $(`<a class='conteneur-noms'
                                href='/service/${service.id}' 
                                id='nom-${service.id}'>
                              <div class='nom-service'>
                                ${service.nomService}
                              </div>
                              <div class='nom-organisation'>
                                ${service.organisationResponsable}
                              </div>
                              ${
                                service.aUneSuggestionAction
                                  ? `<div class="avertissement-completion">
                                   <img src="/statique/assets/images/icone_danger_bleu.svg" alt="" />
                                     Informations à mettre à jour
                                 </div>`
                                  : ''
                              }
                            </a>`);
      $celluleNoms.append($inputSelection);
      $celluleNoms.append($nomService);
      $ligne.append($celluleNoms);
      const $celluleCollaborateur = $('<td></td>');
      const $conteneurCollaborateur = $(
        `<div class='conteneur-contributeur ${
          service.estProprietaire ? 'proprietaire' : ''
        }' title='${
          service.estProprietaire ? 'Service dont je suis propriétaire' : ''
        }'></div>`
      );
      const $nombreContributeurs = $(
        `<button class='contributeurs ouvre-tiroir' title='${metEnFormeContributeurs(
          service
        )}' data-action='contributeurs'>${service.nombreContributeurs}</button>`
      );
      $conteneurCollaborateur.append($nombreContributeurs);
      $celluleCollaborateur.append($conteneurCollaborateur);
      $ligne.append($celluleCollaborateur);

      let contenuIndiceCyber = `<a href='/service/${service.id}/indiceCyber' title='Accéder à la page Indice Cyber' class='conteneur-indice-cyber'><span class='note'>${service.indiceCyber}</span><span class='note-totale'>/5</span></a>`;
      if (tableauDesServices.estEnChargement) {
        contenuIndiceCyber = '<div class="icone-chargement"></div>';
      } else if (
        parseFloat(service.indiceCyber) === 0 ||
        !service.indiceCyber
      ) {
        contenuIndiceCyber = '-';
      }
      $ligne.append(
        $(`<td class="cellule-indice-cyber">${contenuIndiceCyber}</td>`)
      );
      const typeElementHtml = service.statutHomologation ? 'a' : 'div';
      const lienHomologation = service.statutHomologation?.enCoursEdition
        ? `/service/${service.id}/homologation/edition/etape/${service.statutHomologation.etapeCourante}`
        : `/service/${service.id}/dossiers`;
      $ligne.append(
        $(
          `<td><${typeElementHtml} class='statut-homologation statut-${
            service.statutHomologation?.id ?? 'inconnu'
          } ${
            service.statutHomologation?.enCoursEdition ? 'enCoursEdition' : ''
          }' href='${lienHomologation}'>${
            service.statutHomologation?.libelle ?? '-'
          }</${typeElementHtml}></td>`
        )
      );
      tableauDesServices.$tableau.append($ligne);
    });
  },
  videTableau: () => {
    tableauDesServices.$tableau.empty();
  },
};

export default tableauDesServices;
export { ORDRE_DE_TRI };
