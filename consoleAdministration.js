const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./src/adaptateurs/fabriqueAdaptateurJournalMSS');
const EvenementCompletudeServiceModifiee = require('./src/modeles/journalMSS/evenementCompletudeServiceModifiee');
const { avecPMapPourChaqueElement } = require('./src/utilitaires/pMap');

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

  supprimeHomologationsDeUtilisateur(idUtilisateur, idsHomologationsAConserver) {
    return this.depotDonnees.supprimeHomologationsCreeesPar(
      idUtilisateur,
      idsHomologationsAConserver
    );
  }

  supprimeUtilisateur(id) {
    return this.depotDonnees.supprimeUtilisateur(id);
  }

  genereTousEvenementsCompletude(persisteEvenements = false) {
    const journalQuiLog = {
      consigneEvenement: (evenement) => {
        /* eslint-disable no-console */
        console.log(evenement);
        console.log('---------------');
        return Promise.resolve();
        /* eslint-enable no-console */
      },
    };

    const persiste = (evenement) => (persisteEvenements
      ? this.adaptateurJournalMSS.consigneEvenement(evenement)
      : journalQuiLog.consigneEvenement(evenement));

    const evenements = this.depotDonnees.toutesHomologations()
      .then((hs) => hs.map((h) => ({ idService: h.id, ...h.completudeMesures() })))
      .then((stats) => stats.map((s) => new EvenementCompletudeServiceModifiee(s).toJSON()));

    return avecPMapPourChaqueElement(evenements, persiste);
  }
}

module.exports = ConsoleAdministration;
