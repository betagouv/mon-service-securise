const axios = require('axios');
const { AxiosError } = require('axios');
const donneesReferentiel = require('./donneesReferentiel');
const DepotDonnees = require('./src/depotDonnees');
const Referentiel = require('./src/referentiel');
const adaptateurJWT = require('./src/adaptateurs/adaptateurJWT');
const AdaptateurPostgres = require('./src/adaptateurs/adaptateurPostgres');
const { fabriqueAdaptateurUUID } = require('./src/adaptateurs/adaptateurUUID');
const fabriqueAdaptateurJournalMSS = require('./src/adaptateurs/fabriqueAdaptateurJournalMSS');
const EvenementCompletudeServiceModifiee = require('./src/modeles/journalMSS/evenementCompletudeServiceModifiee');
const EvenementNouvelleHomologationCreee = require('./src/modeles/journalMSS/evenementNouvelleHomologationCreee');
const EvenementNouvelUtilisateurInscrit = require('./src/modeles/journalMSS/evenementNouvelUtilisateurInscrit');
const { avecPMapPourChaqueElement } = require('./src/utilitaires/pMap');
const FabriqueAutorisation = require('./src/modeles/autorisations/fabriqueAutorisation');
const {
  EvenementCollaboratifServiceModifie,
} = require('./src/modeles/journalMSS/evenementCollaboratifServiceModifie');
const {
  fabriqueAdaptateurChiffrement,
} = require('./src/adaptateurs/fabriqueAdaptateurChiffrement');
const adaptateurRechercheEntrepriseAPI = require('./src/adaptateurs/adaptateurRechercheEntrepriseAPI');
const adaptateurMail = require('./src/adaptateurs/adaptateurMailSendinblue');
const CrmBrevo = require('./src/crm/crmBrevo');
const {
  verifieCoherenceDesDroits,
} = require('./src/modeles/autorisations/gestionDroits');
const BusEvenements = require('./src/bus/busEvenements');
const {
  fabriqueAdaptateurGestionErreur,
} = require('./src/adaptateurs/fabriqueAdaptateurGestionErreur');
const { cableTousLesAbonnes } = require('./src/bus/cablage');
const adaptateurHorloge = require('./src/adaptateurs/adaptateurHorloge');
const fabriqueAdaptateurTracking = require('./src/adaptateurs/fabriqueAdaptateurTracking');

class ConsoleAdministration {
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    this.adaptateurPersistance =
      AdaptateurPostgres.nouvelAdaptateur(environnementNode);
    this.referentiel = Referentiel.creeReferentiel(donneesReferentiel);

    const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
    const busEvenements = new BusEvenements({ adaptateurGestionErreur });

    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT,
      adaptateurPersistance: this.adaptateurPersistance,
      adaptateurUUID: fabriqueAdaptateurUUID(),
      referentiel: this.referentiel,
      adaptateurRechercheEntite: adaptateurRechercheEntrepriseAPI,
      busEvenements,
    });

    this.adaptateurJournalMSS = fabriqueAdaptateurJournalMSS();
    this.crmBrevo = new CrmBrevo({
      adaptateurMail,
      adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
    });

    const adaptateurTracking = fabriqueAdaptateurTracking();
    cableTousLesAbonnes(busEvenements, {
      adaptateurHorloge,
      adaptateurTracking,
      adaptateurJournal: this.adaptateurJournalMSS,
      adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
      adaptateurMail,
      depotDonnees: this.depotDonnees,
      referentiel: this.referentiel,
    });

    this.journalConsole = {
      consigneEvenement: (evenement) => {
        /* eslint-disable no-console */
        console.log(`${JSON.stringify(evenement)}\n---------------`);
        return Promise.resolve();
        /* eslint-enable no-console */
      },
    };
  }

  supprimeContributeur(idContributeur, idHomologation) {
    return this.depotDonnees.supprimeContributeur(
      idContributeur,
      idHomologation
    );
  }

  supprimeHomologation(idHomologation) {
    return this.depotDonnees.supprimeHomologation(idHomologation);
  }

  async supprimeUtilisateur(id) {
    const utilisateur = await this.depotDonnees.utilisateur(id);
    if (utilisateur) {
      await this.depotDonnees.supprimeUtilisateur(id);
      await adaptateurMail.supprimeContact(utilisateur.email);
    }
  }

  async genereTousEvenementsCompletude(persisteEvenements = false) {
    const journal = persisteEvenements
      ? this.adaptateurJournalMSS
      : this.journalConsole;

    const services = await this.depotDonnees.tousLesServices();
    const evenements = services
      .map((s) =>
        new EvenementCompletudeServiceModifiee({
          service: s,
          organisationResponsable: {},
        }).toJSON()
      )
      .map(({ donnees, ...reste }) => ({
        donnees: { ...donnees, genereParAdministrateur: true },
        ...reste,
      }));

    await avecPMapPourChaqueElement(
      Promise.resolve(evenements),
      journal.consigneEvenement
    );
  }

  genereTousEvenementsNouvelUtilisateurInscrit(persisteEvenements = false) {
    const journal = persisteEvenements
      ? this.adaptateurJournalMSS
      : this.journalConsole;

    const evenements = this.depotDonnees
      .tousUtilisateurs()
      .then((tous) =>
        tous.map(({ id, dateCreation }) =>
          new EvenementNouvelUtilisateurInscrit(
            { idUtilisateur: id },
            { date: dateCreation }
          ).toJSON()
        )
      )
      .then((evenementsBruts) =>
        evenementsBruts.map(({ donnees, ...reste }) => ({
          donnees: { ...donnees, genereParAdministrateur: true },
          ...reste,
        }))
      );

    return avecPMapPourChaqueElement(evenements, journal.consigneEvenement);
  }

  async genereTousEvenementsNouvelleHomologation(persisteEvenements = false) {
    const journal = persisteEvenements
      ? this.adaptateurJournalMSS
      : this.journalConsole;

    const tous = await this.depotDonnees.tousLesServices();
    const dossiersParService = tous.map((h) => ({
      idService: h.id,
      finalises: h.dossiers.finalises(),
    }));

    const evenements = dossiersParService
      .map(({ idService, finalises }) =>
        finalises.map((f) =>
          new EvenementNouvelleHomologationCreee(
            {
              idService,
              dateHomologation: f.decision.dateHomologation,
              dureeHomologationMois: this.referentiel.nbMoisDecalage(
                f.decision.dureeValidite
              ),
            },
            { date: new Date(f.decision.dateHomologation) }
          ).toJSON()
        )
      )
      .flat()
      .map(({ donnees, ...reste }) => ({
        donnees: { ...donnees, genereParAdministrateur: true },
        ...reste,
      }));

    return avecPMapPourChaqueElement(
      Promise.resolve(evenements),
      journal.consigneEvenement
    );
  }

  async genereTousEvenementsCollaboratif(persisteEvenements = false) {
    const journal = persisteEvenements
      ? this.adaptateurJournalMSS
      : this.journalConsole;

    const tousServices = await this.depotDonnees.tousLesServices();

    const genereAutorisationsDuService = async (idService) => {
      const donneesFraiches =
        await this.adaptateurPersistance.autorisationsDuService(idService);

      return new EvenementCollaboratifServiceModifie({
        idService,
        autorisations: donneesFraiches
          .map(FabriqueAutorisation.fabrique)
          .map((a) => ({
            idUtilisateur: a.idUtilisateur,
            droit: a.resumeNiveauDroit(),
          })),
      }).toJSON();
    };

    const tousEvenements = await Promise.all(
      tousServices.map(async (service) =>
        genereAutorisationsDuService(service.id)
      )
    );
    const evenementsAdmin = tousEvenements.map(({ donnees, ...reste }) => ({
      donnees: { ...donnees, genereParAdministrateur: true },
      ...reste,
    }));

    return avecPMapPourChaqueElement(
      Promise.resolve(evenementsAdmin),
      journal.consigneEvenement
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async genereEvenenentsBrevo(typeEvenement, idListe) {
    const log = {
      jaune: (txt) => process.stdout.write(`\x1b[33m${txt}\x1b[0m`),
      cyan: (txt) => process.stdout.write(`\x1b[36m${txt}\x1b[0m`),
      vert: (txt) => process.stdout.write(`\x1b[92m${txt}\x1b[0m`),
      rouge: (txt) => process.stdout.write(`\x1b[31m${txt}\x1b[0m`),
    };

    const configHttp = (clefApi) => ({
      headers: {
        ...clefApi,
        accept: 'application/json',
        'content-type': 'application/json',
      },
    });

    const recupereContacts = async () => {
      const config = configHttp({
        'api-key': process.env.SENDINBLUE_EMAIL_CLEF_API,
      });
      const urlListe = `https://api.brevo.com/v3/contacts/lists/${idListe}`;
      const detailListe = (await axios.get(urlListe, config)).data;
      const nbContacts = detailListe.uniqueSubscribers;

      const taillePaquet = 500;
      const contacts = [];
      log.jaune(
        `📦 ${nbContacts} dans la liste, à récupérer par paquet de ${taillePaquet}\n`
      );

      for (let i = 0; i < nbContacts / taillePaquet; i += 1) {
        const offset = i * taillePaquet;
        const url = `${urlListe}/contacts?limit=${taillePaquet}&offset=${offset}`;
        log.cyan(
          `🚚 Paquet de ${offset} à ${(i + 1) * taillePaquet}… ${url}\n`
        );

        // eslint-disable-next-line no-await-in-loop
        const paquet = (await axios.get(url, config)).data.contacts;
        contacts.push(...paquet);
      }

      return contacts;
    };

    const envoieUnEvent = async (email) => {
      const url = `https://in-automate.sendinblue.com/api/v2/trackEvent`;
      const config = configHttp({
        'ma-key': process.env.SENDINBLUE_TRACKING_CLEF_API,
      });
      await axios.post(url, { email, event: typeEvenement }, config);
    };

    log.jaune(
      `🪵 Génération d'événements \`${typeEvenement}\` pour les contacts de la liste ${idListe}\n`
    );

    const contacts = await recupereContacts();
    const nbContacts = contacts.length;
    log.jaune(`👨‍👩‍👧‍👦 Contacts récupérés : ${nbContacts}\n`);

    let i = 0;
    const avanceAuSuivant = () => {
      i += 1;
    };

    const traiteUnContact = async (contact) => {
      const avancement = ((i / nbContacts) * 100).toFixed(0);
      const now = new Date(Date.now()).toISOString();
      log.cyan(
        `[${now}] CONTACT ${i}/${nbContacts} (${avancement}%) ${contact.email}`
      );

      try {
        await envoieUnEvent(contact.email);
        log.vert(` OK\n`);
      } catch (e) {
        log.rouge(`ERREUR\n${e.toString()}\n`);
      }
    };

    let interval;
    const traiteOuQuitte = async () => {
      if (i < nbContacts) {
        avanceAuSuivant();
        await traiteUnContact(contacts[i - 1]);
      } else {
        clearInterval(interval);
        log.jaune('FIN\n');
      }
    };
    interval = setInterval(() => traiteOuQuitte(), 600);
  }

  static async rattrapage(
    collectionARattraper,
    fonctionMessageErreur,
    fonctionRattrapage
  ) {
    let rapportExecution = '';
    let iteration = 1;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of collectionARattraper) {
      process.stdout.write(`\r${iteration}/${collectionARattraper.length}`);
      try {
        // eslint-disable-next-line no-await-in-loop
        await fonctionRattrapage(item);
      } catch (e) {
        let raisonErreur;
        if (e instanceof AxiosError) {
          raisonErreur = `[${e?.response?.status}]: ${e?.response?.data?.message}`;
        } else {
          raisonErreur = e.toString();
        }
        rapportExecution += `${fonctionMessageErreur(item)}: ${raisonErreur}\n`;
      }
      iteration += 1;
    }
    // eslint-disable-next-line no-console
    console.log(`\n${rapportExecution}`);
  }

  async rattrapageProfilsContactBrevo() {
    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const afficheErreur = (utilisateur) => `Erreur pour ${utilisateur.email}`;
    const rattrapeUtilisateur = async (utilisateur) =>
      this.crmBrevo.metAJourProfilContact(utilisateur);

    return ConsoleAdministration.rattrapage(
      tousUtilisateurs,
      afficheErreur,
      rattrapeUtilisateur
    );
  }

  async rattrapageNombreServicesContactBrevo() {
    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const afficheErreur = (utilisateur) => `Erreur pour ${utilisateur.email}`;
    const rattrapeUtilisateur = async (utilisateur) => {
      const autorisationsUtilisateur = await this.depotDonnees.autorisations(
        utilisateur.id
      );
      await this.crmBrevo.metAJourNombresContributionsContact(
        utilisateur,
        autorisationsUtilisateur
      );
    };
    return ConsoleAdministration.rattrapage(
      tousUtilisateurs,
      afficheErreur,
      rattrapeUtilisateur
    );
  }

  async rattrapageLienEntrepriseEtContactBrevo() {
    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const utilisateursAvecSiret = tousUtilisateurs.filter(
      (u) => u.entite.siret
    );
    const afficheErreur = (utilisateur) =>
      `Erreur pour ${utilisateur.email} avec siret ${utilisateur.entite.siret}`;
    const rattrapeUtilisateur = async (utilisateur) =>
      this.crmBrevo.creerLienEntrepriseContact(utilisateur);

    return ConsoleAdministration.rattrapage(
      utilisateursAvecSiret,
      afficheErreur,
      rattrapeUtilisateur
    );
  }

  async rattrapageEstimationNombreServicesContactBrevo() {
    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const utilisateursAvecEstimation = tousUtilisateurs.filter(
      (u) =>
        (u.estimationNombreServices?.borneBasse ?? '0') !== '0' &&
        (u.estimationNombreServices?.borneHaute ?? '0') !== '0'
    );

    const afficheErreur = (utilisateur) => `Erreur pour ${utilisateur.email}`;
    const rattrapeUtilisateur = async (utilisateur) =>
      this.crmBrevo.metAJourEstimationNombreServicesContact(utilisateur);

    return ConsoleAdministration.rattrapage(
      utilisateursAvecEstimation,
      afficheErreur,
      rattrapeUtilisateur
    );
  }

  async transformeAutorisationEnProprietaire(idAutorisation) {
    const devientProprietaire = { estProprietaire: true };

    if (!verifieCoherenceDesDroits(devientProprietaire))
      throw Error("L'autorisation de propriétaire n'est pas valide");

    const ciblee = await this.depotDonnees.autorisation(idAutorisation);
    if (!ciblee)
      throw Error(`L'autorisation "${idAutorisation}" est introuvable`);

    ciblee.appliqueDroits(devientProprietaire);
    await this.depotDonnees.sauvegardeAutorisation(ciblee);

    // eslint-disable-next-line no-console
    console.log('DONE');
  }

  async basculeBlocklistBrevo() {
    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const utilisateursTransactionnels = tousUtilisateurs.filter(
      (u) => u.transactionnelAccepte
    );
    const afficheErreur = (utilisateur) => `Erreur pour ${utilisateur.email}`;
    const rattrapeUtilisateur = async (utilisateur) =>
      adaptateurMail.inscrisEmailsTransactionnels(utilisateur.email);

    return ConsoleAdministration.rattrapage(
      utilisateursTransactionnels,
      afficheErreur,
      rattrapeUtilisateur
    );
  }
}

module.exports = ConsoleAdministration;
