const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');

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
  .then((u) => depotDonnees.nouvelleHomologation(u.id, { nomService: 'Dossier de test' }));

if (process.env.CREATION_UTILISATEUR_DEMO) {
  const adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur(
    process.env.NODE_ENV || 'development'
  );
  const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
  const depotDonnees = DepotDonnees.creeDepot({
    adaptateurJWT, adaptateurPersistance, adaptateurUUID, referentiel,
  });

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
