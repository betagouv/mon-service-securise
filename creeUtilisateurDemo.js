const fabriqueAdaptateurPersistance = require('./src/adaptateurs/fabriqueAdaptateurPersistance');
const DepotDonnees = require('./src/depotDonnees');
const DescriptionService = require('./src/modeles/descriptionService');
const Referentiel = require('./src/referentiel');

const referentiel = Referentiel.creeReferentiel();
const descriptionService = new DescriptionService({
  delaiAvantImpactCritique: 'plusUneJournee',
  localisationDonnees: 'france',
  nomService: 'Dossier de test',
  provenanceService: 'developpement',
  risqueJuridiqueFinancierReputationnel: false,
  statutDeploiement: 'enLigne',
  typeService: ['siteInternet'],
}, referentiel);

const creeDonnees = (depotDonnees) => depotDonnees
  .nouvelUtilisateur({
    prenom: process.env.PRENOM_UTILISATEUR_DEMO,
    nom: process.env.NOM_UTILISATEUR_DEMO,
    email: process.env.EMAIL_UTILISATEUR_DEMO,
    cguAcceptees: true,
  })
  .then((u) => (
    depotDonnees.metsAJourMotDePasse(u.id, process.env.MOT_DE_PASSE_UTILISATEUR_DEMO)
  ))
  .then((u) => depotDonnees.nouvelleHomologation(u.id, descriptionService.toJSON()));

if (process.env.CREATION_UTILISATEUR_DEMO) {
  const adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV);
  const depotDonnees = DepotDonnees.creeDepot();

  /* eslint-disable no-console */
  adaptateurPersistance.utilisateurAvecEmail(process.env.EMAIL_UTILISATEUR_DEMO)
    .then((u) => {
      if (u) {
        console.log('Utilisateur déjà existant !…');
        process.exit(0);
      }

      creeDonnees(depotDonnees)
        .then(() => {
          console.log('Utilisateur de démonstration créé !');
          process.exit(0);
        });
    });
  /* eslint-enable no-console */
}
