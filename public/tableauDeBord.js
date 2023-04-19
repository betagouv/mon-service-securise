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
      const $ligne = $('<tr></tr>');
      const $celluleNoms = $("<td class='cellule-noms'></td>");
      const $nomService = $(`<div class='conteneur-noms'>
                              <div class='nom-service'>${service.nomService}</div>
                              <div class='nom-organisation'>${service.organisationsResponsables[0]}</div>
                            </div>`);
      $celluleNoms.append($nomService);
      $ligne.append($celluleNoms);
      $ligne.append($(`<td><div class='contributeurs' title='${metEnFormeContributeurs(service)}'>${service.nombreContributeurs}</div></td>`));
      $ligne.append($(`<td>${parseFloat(service.indiceCyber) === 0 ? '-' : service.indiceCyber}</td>`));
      $ligne.append($(`<td><div class='statut-homologation statut-${service.statutHomologation}'>${STATUS_HOMOLOGATION[service.statutHomologation]}</div></td>`));
      $ligne.append($('<td>...</td>'));

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
  $('#indice-cyber-moyen').text(resume.indiceCyberMoyen.toFixed(1));
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
});
