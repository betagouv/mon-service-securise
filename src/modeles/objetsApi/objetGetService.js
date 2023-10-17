const Dossiers = require('../dossiers');
const AutorisationBase = require('../autorisations/autorisationBase');

const { DROITS_VOIR_STATUT_HOMOLOGATION } = AutorisationBase;

const representeContributeur = (contributeur, estProprietaire) => ({
  id: contributeur.id,
  prenomNom: contributeur.prenomNom(),
  initiales: contributeur.initiales(),
  poste: contributeur.posteDetaille(),
  estProprietaire,
});

const donnees = (service, autorisation, idUtilisateur, referentiel) => ({
  id: service.id,
  nomService: service.nomService(),
  organisationsResponsables:
    service.descriptionService.organisationsResponsables ?? [],
  contributeurs: [
    representeContributeur(service.createur, true),
    ...service.contributeurs.map((c) => representeContributeur(c, false)),
  ],
  ...(autorisation.aLesPermissions(DROITS_VOIR_STATUT_HOMOLOGATION) && {
    statutHomologation: {
      id: service.dossiers.statutHomologation(),
      enCoursEdition: service.dossiers.statutSaisie() === Dossiers.A_COMPLETER,
      ...referentiel.statutHomologation(service.dossiers.statutHomologation()),
    },
  }),
  nombreContributeurs: service.contributeurs.length + 1,
  estProprietaire: service.createur.id === idUtilisateur,
  documentsPdfDisponibles: service.documentsPdfDisponibles(autorisation),
  permissions: {
    gestionContributeurs: autorisation.peutGererContributeurs(),
  },
});

module.exports = { donnees };
