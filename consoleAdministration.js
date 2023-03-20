const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./src/adaptateurs/fabriqueAdaptateurJournalMSS');
const EvenementCompletudeServiceModifiee = require('./src/modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementProfilUtilisateurModifie = require('./src/modeles/journalMSS/evenementProfilUtilisateurModifie');
const { avecPMapPourChaqueElement } = require('./src/utilitaires/pMap');

class ConsoleAdministration {
  constructor(environnementNode = (process.env.NODE_ENV || 'development')) {
    const adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur(environnementNode);
    const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurJWT, adaptateurPersistance, adaptateurUUID, referentiel,
    });
    this.adaptateurJournalMSS = fabriqueAdaptateurJournalMSS();

    this.journalConsole = {
      consigneEvenement: (evenement) => {
        /* eslint-disable no-console */
        console.log(`${JSON.stringify(evenement)}\n---------------`);
        return Promise.resolve();
        /* eslint-enable no-console */
      },
    };
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

  genereTousEvenementsCompletude(persisteEvenements = false) {
    const journal = (persisteEvenements ? this.adaptateurJournalMSS : this.journalConsole);

    const evenements = this.depotDonnees.toutesHomologations()
      .then((hs) => hs.map((h) => ({ idService: h.id, ...h.completudeMesures() })))
      .then((stats) => stats.map((s) => new EvenementCompletudeServiceModifiee(s).toJSON()));

    return avecPMapPourChaqueElement(evenements, journal.consigneEvenement);
  }

  genereTousEvenementsProfilUtilisateur(persisteEvenements = false) {
    const journal = (persisteEvenements ? this.adaptateurJournalMSS : this.journalConsole);

    const evenements = this.depotDonnees.tousUtilisateurs()
      .then((tous) => tous.map(({ id, ...donnees }) => ({ idUtilisateur: id, ...donnees })))
      .then((donnees) => donnees.map((d) => new EvenementProfilUtilisateurModifie(d).toJSON()))
      .then((evenementsBruts) => evenementsBruts.map(({ donnees, ...reste }) => (
        { donnees: { ...donnees, genereParAdministrateur: true }, ...reste }
      )));

    return avecPMapPourChaqueElement(evenements, journal.consigneEvenement);
  }
}

module.exports = ConsoleAdministration;
