const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const adaptateurUUID = require('./src/adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./src/adaptateurs/fabriqueAdaptateurJournalMSS');
const EvenementCompletudeServiceModifiee = require('./src/modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementNouvelleHomologationCreee = require('./src/modeles/journalMSS/evenementNouvelleHomologationCreee');
const EvenementNouvelUtilisateurInscrit = require('./src/modeles/journalMSS/evenementNouvelUtilisateurInscrit');
const { avecPMapPourChaqueElement } = require('./src/utilitaires/pMap');

class ConsoleAdministration {
  constructor(environnementNode = (process.env.NODE_ENV || 'development')) {
    const adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur(environnementNode);
    this.referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurJWT, adaptateurPersistance, adaptateurUUID, referentiel: this.referentiel,
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

  dupliqueHomologation(idService) {
    return this.depotDonnees.dupliqueService(idService);
  }

  transfereAutorisations(idUtilisateurSource, idUtilisateurCible) {
    return this.depotDonnees.transfereAutorisations(idUtilisateurSource, idUtilisateurCible);
  }

  supprimeContributeur(idContributeur, idHomologation) {
    return this.depotDonnees.supprimeContributeur(idContributeur, idHomologation);
  }

  supprimeHomologation(idService) {
    return this.depotDonnees.supprimeService(idService);
  }

  supprimeHomologationsDeUtilisateur(idUtilisateur, idsServicesAConserver) {
    return this.depotDonnees.supprimeServicesCreesPar(
      idUtilisateur,
      idsServicesAConserver
    );
  }

  supprimeUtilisateur(id) {
    return this.depotDonnees.supprimeUtilisateur(id);
  }

  genereTousEvenementsCompletude(persisteEvenements = false) {
    const journal = (persisteEvenements ? this.adaptateurJournalMSS : this.journalConsole);

    const evenements = this.depotDonnees.tousServices()
      .then((hs) => hs.map((h) => ({ idService: h.id, ...h.completudeMesures() })))
      .then((stats) => stats.map((s) => new EvenementCompletudeServiceModifiee(s).toJSON()));

    return avecPMapPourChaqueElement(evenements, journal.consigneEvenement);
  }

  genereTousEvenementsNouvelUtilisateurInscrit(persisteEvenements = false) {
    const journal = (persisteEvenements ? this.adaptateurJournalMSS : this.journalConsole);

    const evenements = this.depotDonnees.tousUtilisateurs()
      .then((tous) => tous.map(({ id, dateCreation }) => (
        new EvenementNouvelUtilisateurInscrit(
          { idUtilisateur: id },
          { date: dateCreation }
        ).toJSON()
      )))
      .then((evenementsBruts) => evenementsBruts.map(({ donnees, ...reste }) => (
        { donnees: { ...donnees, genereParAdministrateur: true }, ...reste }
      )));

    return avecPMapPourChaqueElement(evenements, journal.consigneEvenement);
  }

  async genereTousEvenementsNouvelleHomologation(persisteEvenements = false) {
    const journal = (persisteEvenements ? this.adaptateurJournalMSS : this.journalConsole);

    const toutes = await this.depotDonnees.tousServices();
    const dossiersParService = toutes.map((h) => ({
      idService: h.id,
      finalises: h.dossiers.finalises(),
    }));

    const evenements = dossiersParService.map(
      ({ idService, finalises }) => finalises.map(
        (f) => new EvenementNouvelleHomologationCreee({
          idService,
          dateHomologation: f.decision.dateHomologation,
          dureeHomologationMois: this.referentiel.nbMoisDecalage(f.decision.dureeValidite),
        },
        { date: new Date(f.decision.dateHomologation) })
          .toJSON()
      )
    )
      .flat()
      .map(({ donnees, ...reste }) => ({
        donnees: { ...donnees, genereParAdministrateur: true },
        ...reste,
      }));

    return avecPMapPourChaqueElement(Promise.resolve(evenements), journal.consigneEvenement);
  }
}

module.exports = ConsoleAdministration;
