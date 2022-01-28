const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');

class ConsoleAdministration {
  constructor(environnementNode = (process.env.NODE_ENV || 'development')) {
    const adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur(environnementNode);
    const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurJWT, adaptateurPersistance, adaptateurUUID, referentiel,
    });
  }

  transfereAutorisations(idUtilisateurSource, idUtilisateurCible) {
    return this.depotDonnees.transfereAutorisations(idUtilisateurSource, idUtilisateurCible);
  }
}

module.exports = ConsoleAdministration;
