import { brancheModale } from './modules/interactions/modale.mjs';
import gestionnaireTirroir from './modules/tableauDeBord/gestionnaireTirroir.mjs';
import gestionnaireEvenements from './modules/tableauDeBord/gestionnaireEvenements.mjs';
import tableauDesServices from './modules/tableauDeBord/tableauDesServices.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

const remplisCartesInformations = (resume) => {
  $('#nombre-services').text(resume.nombreServices);
  $('#nombre-services-homologues').text(resume.nombreServicesHomologues);
  $('#indice-cyber-moyen').text(resume.indiceCyberMoyen?.toFixed(1) ?? '-');
};

const afficheBandeauMajProfil = () => {
  $('.bandeau-maj-profil').removeClass('invisible');
};

const recupereServices = () => {
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
};

const gestionnaireActions = {
  brancheComportements: () => {
    $('#action-duplication').on('click', () => {
      const $nombreCopie = $('#nombre-copie');
      if ($nombreCopie.is(':valid')) {
        $nombreCopie.prop('disabled', true);
        $('#action-duplication').prop('disabled', true);

        const nombreCopies = parseInt($nombreCopie.val(), 10) || 1;
        const promesses = [...tableauDesServices.servicesSelectionnes].map((idService) => (
          tableauDeLongueur(nombreCopies).reduce((acc) => acc.then(
            () => axios({ method: 'copy', url: `/api/service/${idService}` })
          ), Promise.resolve())
        ));
        Promise.all(promesses).then(() => {
          $nombreCopie.prop('disabled', false);
          $('#action-duplication').prop('disabled', false);
          gestionnaireTirroir.basculeOuvert(false);
          recupereServices();
        });
      }
    });
  },
};

$(() => {
  brancheModale('#nouveau-service', '#modale-nouveau-service');

  recupereServices();

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
    } else if ($elementClique.hasClass('action')) {
      gestionnaireEvenements.gereAction($elementClique);
    } else {
      gestionnaireEvenements.fermeToutMenuFlottant();
    }
  });

  $('.tirroir .fermeture-tirroir').on('click', () => {
    gestionnaireTirroir.basculeOuvert(false);
  });

  gestionnaireActions.brancheComportements();
});
