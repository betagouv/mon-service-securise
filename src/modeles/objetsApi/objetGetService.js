const Dossiers = require('../dossiers');
const { Permissions, Rubriques } = require('../autorisations/gestionDroits');

const { LECTURE } = Permissions;
const { HOMOLOGUER } = Rubriques;

const donnees = (service, autorisation, idUtilisateur, referentiel) => ({
  id: service.id,
  nomService: service.nomService(),
  organisationsResponsables:
    service.descriptionService.organisationsResponsables ?? [],
  createur: {
    id: service.createur.id,
    prenomNom: service.createur.prenomNom(),
    initiales: service.createur.initiales(),
    poste: service.createur.posteDetaille(),
  },
  contributeurs: service.contributeurs.map((c) => ({
    id: c.id,
    prenomNom: c.prenomNom(),
    initiales: c.initiales(),
    poste: c.posteDetaille(),
  })),
  ...(autorisation.aLaPermission(LECTURE, HOMOLOGUER) && {
    statutHomologation: {
      id: service.dossiers.statutHomologation(),
      enCoursEdition: service.dossiers.statutSaisie() === Dossiers.A_COMPLETER,
      ...referentiel.statutHomologation(service.dossiers.statutHomologation()),
    },
  }),
  nombreContributeurs: service.contributeurs.length + 1,
  estCreateur: service.createur.id === idUtilisateur,
  documentsPdfDisponibles: service.documentsPdfDisponibles(autorisation),
  permissions: {
    gestionContributeurs: autorisation.peutGererContributeurs(),
  },
});

module.exports = { donnees };
