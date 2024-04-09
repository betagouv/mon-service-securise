const fabriqueAdaptateurPersistance = require('./src/adaptateurs/fabriqueAdaptateurPersistance');
const DepotDonnees = require('./src/depotDonnees');
const DescriptionService = require('./src/modeles/descriptionService');
const Referentiel = require('./src/referentiel');
const BusEvenements = require('./src/bus/busEvenements');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./src/adaptateurs/fabriqueAdaptateurGestionErreur');
const {
  fabriqueAdaptateurChiffrement,
} = require('./src/adaptateurs/fabriqueAdaptateurChiffrement');

const referentiel = Referentiel.creeReferentiel();
const descriptionService = new DescriptionService(
  {
    delaiAvantImpactCritique: 'plusUneJournee',
    localisationDonnees: 'france',
    nomService: 'Dossier de test',
    presentation:
      "Le service créé par MonServiceSécurisé comme donnée d'exemple sur ses environnements de DÉMO.",
    provenanceService: 'developpement',
    risqueJuridiqueFinancierReputationnel: false,
    statutDeploiement: 'enLigne',
    typeService: ['siteInternet'],
    organisationResponsable: {
      nom: 'Agglomération de Mansart',
      siret: '12345',
      departement: '75',
    },
    nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
  },
  referentiel
);

const creeDonnees = async (depotDonnees) => {
  const u = await depotDonnees.nouvelUtilisateur({
    prenom: process.env.PRENOM_UTILISATEUR_DEMO,
    nom: process.env.NOM_UTILISATEUR_DEMO,
    email: process.env.EMAIL_UTILISATEUR_DEMO,
    cguAcceptees: true,
  });

  await depotDonnees.metsAJourMotDePasse(
    u.id,
    process.env.MOT_DE_PASSE_UTILISATEUR_DEMO
  );

  await depotDonnees.nouveauService(u.id, {
    descriptionService: descriptionService.toJSON(),
  });
};

const main = async () => {
  if (process.env.CREATION_UTILISATEUR_DEMO) {
    const adaptateurPersistance = fabriqueAdaptateurPersistance(
      process.env.NODE_ENV
    );
    const busEvenements = new BusEvenements({
      adaptateurGestionErreur: fabriqueAdaptateurGestionErreur(),
    });
    const adaptateurChiffrement = fabriqueAdaptateurChiffrement();
    const depotDonnees = DepotDonnees.creeDepot({
      adaptateurChiffrement,
      busEvenements,
    });

    /* eslint-disable no-console */
    const u = await adaptateurPersistance.utilisateurAvecEmail(
      process.env.EMAIL_UTILISATEUR_DEMO
    );

    if (u) {
      console.log('Utilisateur déjà existant !…');
      process.exit(0);
    }

    await creeDonnees(depotDonnees);
    console.log('Utilisateur de démonstration créé !');
    process.exit(0);
    /* eslint-enable no-console */
  }
};

main().then(() => {});
