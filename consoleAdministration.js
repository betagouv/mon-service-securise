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

  dupliqueHomologation(idHomologation) {
    return this.depotDonnees.dupliqueHomologation(idHomologation);
  }

  transfereAutorisations(idUtilisateurSource, idUtilisateurCible) {
    return this.depotDonnees.transfereAutorisations(idUtilisateurSource, idUtilisateurCible);
  }

  supprimeContributeur(idContributeur, idHomologation) {
    return this.depotDonnees.supprimeContributeur(idContributeur, idHomologation);
  }

  supprimeHomologation(idHomologation) {
    return this.depotDonnees.supprimeHomologation(idHomologation);
  }

  supprimeHomologationsDeUtilisateur(idUtilisateur, idsHomologationsAConserver) {
    return this.depotDonnees.supprimeHomologationsCreeesPar(
      idUtilisateur,
      idsHomologationsAConserver
    );
  }

  supprimeUtilisateur(id) {
    return this.depotDonnees.supprimeUtilisateur(id);
  }
}

module.exports = ConsoleAdministration;
