const axios = require('axios');
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
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    const adaptateurPersistance =
      AdaptateurPostgres.nouvelAdaptateur(environnementNode);
    this.referentiel = Referentiel.creeReferentiel(donneesReferentiel);
    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurJWT,
      adaptateurPersistance,
      adaptateurUUID,
      referentiel: this.referentiel,
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

  transfereAutorisations(idUtilisateurSource, idUtilisateurCible) {
    return this.depotDonnees.transfereAutorisations(
      idUtilisateurSource,
      idUtilisateurCible
    );
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

  supprimeHomologationsDeUtilisateur(
    idUtilisateur,
    idsHomologationsAConserver
  ) {
    return this.depotDonnees.supprimeHomologationsCreeesPar(
      idUtilisateur,
      idsHomologationsAConserver
    );
  }

  supprimeUtilisateur(id) {
    return this.depotDonnees.supprimeUtilisateur(id);
  }

  supprimeCompteUtilisateur(idUtilisateur) {
    return this.depotDonnees
      .supprimeHomologationsCreeesPar(idUtilisateur)
      .then(() => this.depotDonnees.supprimeUtilisateur(idUtilisateur));
  }

  genereTousEvenementsCompletude(persisteEvenements = false) {
    const journal = persisteEvenements
      ? this.adaptateurJournalMSS
      : this.journalConsole;

    const evenements = this.depotDonnees
      .toutesHomologations()
      .then((hs) =>
        hs.map((h) => ({ idService: h.id, ...h.completudeMesures() }))
      )
      .then((stats) =>
        stats.map((s) => new EvenementCompletudeServiceModifiee(s).toJSON())
      );

    return avecPMapPourChaqueElement(evenements, journal.consigneEvenement);
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

    const toutes = await this.depotDonnees.toutesHomologations();
    const dossiersParService = toutes.map((h) => ({
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
}

module.exports = ConsoleAdministration;
