const [AUCUNE, ASC] = [0, 1];
const STATUS_HOMOLOGATION = {
  aSaisir: 'À réaliser',
  aCompleter: 'À finaliser',
  completes: 'Réalisée',
};

const afficheBandeauMajProfil = () => $('.bandeau-maj-profil').removeClass('invisible');
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
  recupereServices: () => {
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

export default tableauDesServices;
