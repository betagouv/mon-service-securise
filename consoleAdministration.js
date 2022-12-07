const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./src/adaptateurs/fabriqueAdaptateurJournalMSS');
const { EvenementNouveauServiceCree } = require('./src/modeles/journalMSS/evenements');

class ConsoleAdministration {
  constructor(environnementNode = (process.env.NODE_ENV || 'development')) {
    const adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur(environnementNode);
    const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurJWT, adaptateurPersistance, adaptateurUUID, referentiel,
    });
    this.adaptateurJournalMSS = fabriqueAdaptateurJournalMSS();
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

  genereEvenementsDeCreationService(dateLimite, persisteEvenements = false) {
    const jourSuivant = (date) => {
      const timestampJourSuivant = new Date(date).setDate(date.getDate() + 1);
      return new Date(timestampJourSuivant);
    };

    const evenementPourHomologation = (h) => new EvenementNouveauServiceCree(
      { idUtilisateur: h.createur.id },
      { date: jourSuivant(h.createur.dateCreation) }
    ).toJSON();

    const journalQuiLog = {
      consigneEvenement: (evenement, homologation) => {
        /* eslint-disable no-console */
        console.log(`Pour Service ${homologation.id} : "${homologation.nomService()}"`);
        console.log(evenement);
        console.log('---------------');
        /* eslint-enable no-console */
      },
    };

    const persiste = (evenement, homologation) => (persisteEvenements
      ? this.adaptateurJournalMSS.consigneEvenement(evenement)
      : journalQuiLog.consigneEvenement(evenement, homologation));

    return this.depotDonnees.homologationsCreeesAvantLe(dateLimite)
      .then((homologations) => Promise.all(
        homologations
          .map((homologation) => ({
            evenement: evenementPourHomologation(homologation),
            homologation,
          }))
          .map(({ evenement, homologation }) => persiste(evenement, homologation))
      ));
  }
}

module.exports = ConsoleAdministration;
