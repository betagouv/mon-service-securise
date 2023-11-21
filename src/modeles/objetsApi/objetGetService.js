const Dossiers = require('../dossiers');
const AutorisationBase = require('../autorisations/autorisationBase');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = AutorisationBase;

const donnees = (service, autorisation, referentiel) => ({
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
      enCoursEdition: service.dossiers.statutSaisie() === Dossiers.A_COMPLETER,
      ...referentiel.statutHomologation(service.dossiers.statutHomologation()),
    },
  }),
  nombreContributeurs: service.contributeurs.length,
  estProprietaire: autorisation.estProprietaire,
  documentsPdfDisponibles: service.documentsPdfDisponibles(autorisation),
  permissions: {
    gestionContributeurs: autorisation.peutGererContributeurs(),
  },
});

module.exports = { donnees };
