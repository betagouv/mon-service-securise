const Dossiers = require('../dossiers');
const Autorisation = require('../autorisations/autorisation');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = Autorisation;

const donnees = (service, autorisation, referentiel) => {
  const enCoursEdition =
    service.dossiers.statutSaisie() === Dossiers.A_COMPLETER;
  return {
    id: service.id,
    nomService: service.nomService(),
    organisationsResponsables:
      service.descriptionService.organisationsResponsables ?? [],
    contributeurs: service.contributeurs.map((c) => ({
      id: c.id,
      prenomNom: c.prenomNom(),
      initiales: c.initiales(),
      poste: c.posteDetaille(),
      estUtilisateurCourant: autorisation.designeUtilisateur(c.id),
    })),
    ...(autorisation.aLesPermissions(DROITS_VOIR_STATUT_HOMOLOGATION) && {
      statutHomologation: {
        id: service.dossiers.statutHomologation(),
        enCoursEdition,
        ...(enCoursEdition && {
          etapeCourante: service.dossiers.dossierCourant()?.etapeCourante(),
        }),
        ...referentiel.statutHomologation(
          service.dossiers.statutHomologation()
        ),
      },
    }),
    nombreContributeurs: service.contributeurs.length,
    estProprietaire: autorisation.estProprietaire,
    documentsPdfDisponibles: service.documentsPdfDisponibles(autorisation),
    permissions: {
      gestionContributeurs: autorisation.peutGererContributeurs(),
    },
  };
};

module.exports = { donnees };
