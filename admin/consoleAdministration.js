/* eslint-disable no-console */
import axios from 'axios';
import { inspect } from 'util';
import Knex from 'knex';
import { AdaptateurProfilAnssi } from '@lab-anssi/lib';
import configKnex from '../knexfile.js';
import donneesReferentiel from '../donneesReferentiel.js';
import * as DepotDonnees from '../src/depotDonnees.js';
import * as Referentiel from '../src/referentiel.js';
import { fabriqueAdaptateurJWT } from '../src/adaptateurs/adaptateurJWT.js';
import * as AdaptateurPostgres from '../src/adaptateurs/adaptateurPostgres.js';
import { fabriqueAdaptateurUUID } from '../src/adaptateurs/adaptateurUUID.js';
import fabriqueAdaptateurJournalMSS from '../src/adaptateurs/fabriqueAdaptateurJournalMSS.js';
import EvenementNouvelleHomologationCreee from '../src/modeles/journalMSS/evenementNouvelleHomologationCreee.js';
import EvenementNouvelUtilisateurInscrit from '../src/modeles/journalMSS/evenementNouvelUtilisateurInscrit.js';
import { avecPMapPourChaqueElement } from '../src/utilitaires/pMap.js';
import * as FabriqueAutorisation from '../src/modeles/autorisations/fabriqueAutorisation.js';
import { EvenementCollaboratifServiceModifie } from '../src/modeles/journalMSS/evenementCollaboratifServiceModifie.js';
import { fabriqueAdaptateurChiffrement } from '../src/adaptateurs/fabriqueAdaptateurChiffrement.js';
import * as adaptateurRechercheEntrepriseAPI from '../src/adaptateurs/adaptateurRechercheEntrepriseAPI.js';
import * as adaptateurMail from '../src/adaptateurs/adaptateurMailSendinblue.js';
import CrmBrevo from '../src/crm/crmBrevo.js';
import { verifieCoherenceDesDroits } from '../src/modeles/autorisations/gestionDroits.js';
import BusEvenements from '../src/bus/busEvenements.js';
import { fabriqueAdaptateurGestionErreur } from '../src/adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { cableTousLesAbonnes } from '../src/bus/cablage.js';
import { fabriqueAdaptateurHorloge } from '../src/adaptateurs/adaptateurHorloge.js';
import fabriqueAdaptateurTracking from '../src/adaptateurs/fabriqueAdaptateurTracking.js';
import { consigneCompletudeDansJournal } from '../src/bus/abonnements/consigneCompletudeDansJournal.js';
import { Autorisation } from '../src/modeles/autorisations/autorisation.js';
import { consigneRisquesDansJournal } from '../src/bus/abonnements/consigneRisquesDansJournal.js';
import fabriqueAdaptateurSupervision from '../src/adaptateurs/fabriqueAdaptateurSupervision.js';
import ServiceSupervision from '../src/supervision/serviceSupervision.js';
import * as adaptateurEnvironnement from '../src/adaptateurs/adaptateurEnvironnement.js';
import { adaptateurChiffrementChaCha20 } from '../src/adaptateurs/adaptateurChiffrementChaCha20.js';
import EvenementCguAcceptees from '../src/modeles/journalMSS/evenementCguAcceptees.js';

const log = {
  jaune: (txt) => process.stdout.write(`\x1b[33m${txt}\x1b[0m`),
  cyan: (txt) => process.stdout.write(`\x1b[36m${txt}\x1b[0m`),
  vert: (txt) => process.stdout.write(`\x1b[92m${txt}\x1b[0m`),
  rouge: (txt) => process.stdout.write(`\x1b[31m${txt}\x1b[0m`),
};

class ConsoleAdministration {
  constructor(environnementNode = process.env.NODE_ENV || 'development') {
    this.adaptateurPersistance = AdaptateurPostgres.nouvelAdaptateur({
      env: environnementNode,
    });

    this.referentiel = Referentiel.creeReferentiel(donneesReferentiel);

    const adaptateurGestionErreur = fabriqueAdaptateurGestionErreur();
    const busEvenements = new BusEvenements({ adaptateurGestionErreur });

    this.depotDonnees = DepotDonnees.creeDepot({
      adaptateurChiffrement: fabriqueAdaptateurChiffrement(),
      adaptateurJWT: fabriqueAdaptateurJWT(),
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
    const adaptateurHorloge = fabriqueAdaptateurHorloge();
    this.adaptateurSupervision = fabriqueAdaptateurSupervision();

    cableTousLesAbonnes(busEvenements, {
      adaptateurHorloge,
      adaptateurTracking,
      adaptateurJournal: this.adaptateurJournalMSS,
      adaptateurRechercheEntreprise: adaptateurRechercheEntrepriseAPI,
      adaptateurMail,
      adaptateurSupervision: this.adaptateurSupervision,
      depotDonnees: this.depotDonnees,
      referentiel: this.referentiel,
    });

    this.journalConsole = {
      consigneEvenement: (evenement) => {
        console.log(`${JSON.stringify(evenement)}\n---------------`);
        return Promise.resolve();
      },
    };
  }

  async supprimeService(idService) {
    return this.depotDonnees.supprimeService(idService);
  }

  async genereTousEvenementsCompletude(persisteEvenements = false) {
    const fabriqueFonction = (adaptateurJournal) =>
      consigneCompletudeDansJournal({
        adaptateurJournal,
      });
    await this.executeFonctionSurTousLesServices(
      persisteEvenements,
      fabriqueFonction
    );
  }

  async genereTousEvenementsRisques(persisteEvenements = false) {
    const fabriqueFonction = (adaptateurJournal) =>
      consigneRisquesDansJournal({ adaptateurJournal });
    await this.executeFonctionSurTousLesServices(
      persisteEvenements,
      fabriqueFonction
    );
  }

  async executeFonctionSurTousLesServices(
    persisteEvenements,
    fabriqueFonction
  ) {
    const journal = persisteEvenements
      ? this.adaptateurJournalMSS
      : this.journalConsole;

    const fonction = fabriqueFonction(journal);

    const services = await this.depotDonnees.tousLesServices();
    const nbServices = services.length;
    log.jaune(`${nbServices} services à traiter\n`);

    let i = 0;
    const avanceAuSuivant = () => {
      i += 1;
    };
    let interval;
    const traiteOuQuitte = async () => {
      if (i < nbServices) {
        log.cyan(`Traitement du service ${i + 1}/${nbServices}\n`);
        await fonction({ service: services[i] });
        avanceAuSuivant();
      } else {
        clearInterval(interval);
        log.jaune('FIN\n');
      }
    };
    interval = setInterval(() => traiteOuQuitte(), 200);
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
        if (e instanceof axios.AxiosError) {
          raisonErreur = `[${e?.response?.status}]: ${e?.response?.data?.message}`;
        } else {
          raisonErreur = e.toString();
        }
        rapportExecution += `${fonctionMessageErreur(item)}: ${raisonErreur}\n`;
      }
      iteration += 1;
    }
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

  async utilisateurAvecEmail(email) {
    return this.depotDonnees.utilisateurAvecEmail(email);
  }

  async service(idService) {
    return this.depotDonnees.service(idService);
  }

  async afficheUtilisateurAvecEmail(email) {
    const utilisateur = await this.utilisateurAvecEmail(email);
    if (!utilisateur) {
      console.log(`Pas d'utilisateur avec l'email ${email}`);
    } else {
      console.log(utilisateur.donneesSerialisees());
    }
  }

  async creeUtilisateurAvecMotDePasse(email, motDePasse) {
    const u = await this.depotDonnees.nouvelUtilisateur({
      prenom: 'Prénom',
      nom: 'Nom',
      email,
      entite: {
        siret: '13000766900018',
        nom: 'ANSSI',
        departement: 75,
      },
      estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
      cguAcceptees: true,
    });

    await this.depotDonnees.metsAJourMotDePasse(u.id, motDePasse);
  }

  async afficheAutorisationsDeUtilisateurAvecEmail(email) {
    const utilisateur = await this.utilisateurAvecEmail(email);
    if (!utilisateur) {
      console.log(`Pas d'utilisateur avec l'email ${email}`);
      return;
    }
    const autorisations = await this.depotDonnees.autorisations(utilisateur.id);
    autorisations.forEach((a) => console.log(a.donneesAPersister()));
  }

  async afficheServicesDe(email) {
    const utilisateur = await this.utilisateurAvecEmail(email);
    if (!utilisateur) {
      console.log(`Pas d'utilisateur avec l'email ${email}`);
      return;
    }
    const autorisations = await this.depotDonnees.autorisations(utilisateur.id);
    (
      await Promise.all(
        autorisations.map(async (a) => ({
          ...a,
          service: await this.service(a.idService),
        }))
      )
    ).forEach((a) =>
      console.log({
        idService: a.service.id,
        nomService: a.service.nomService(),
        estProprietaire: a.estProprietaire,
        droits: a.droits,
      })
    );
  }

  async afficheService(idService) {
    const service = await this.service(idService);
    if (!service) {
      console.log(`Pas de service avec l'id ${idService}`);
    } else {
      console.log(
        inspect(service.donneesAPersister().toutes(), {
          depth: Infinity,
          colors: true,
        })
      );
    }
  }

  async ajouteProprietaireAuService(idService, emailNouveauProprietaire) {
    const nouveauProprietaire = await this.utilisateurAvecEmail(
      emailNouveauProprietaire
    );
    const autorisation = Autorisation.NouvelleAutorisationProprietaire({
      idUtilisateur: nouveauProprietaire.id,
      idService,
    });
    await this.depotDonnees.ajouteContributeurAuService(autorisation);
  }

  async transfereAutorisationsApresDepart(
    emailCollaborateurParti,
    emailNouveauProprietaire
  ) {
    const nouveauProprietaire = await this.utilisateurAvecEmail(
      emailNouveauProprietaire
    );
    const collaborateurParti = await this.utilisateurAvecEmail(
      emailCollaborateurParti
    );
    if (!nouveauProprietaire || !collaborateurParti) {
      throw new Error('Utilisateurs inexistants');
    }

    const autorisations = await this.depotDonnees.autorisations(
      collaborateurParti.id
    );
    const autorisationsProprietaire = autorisations.filter(
      (autorisation) => autorisation.estProprietaire
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const autorisationExistante of autorisationsProprietaire) {
      const { idService } = autorisationExistante;
      const nouvelleAutorisation =
        Autorisation.NouvelleAutorisationProprietaire({
          idUtilisateur: nouveauProprietaire.id,
          idService,
        });
      // eslint-disable-next-line no-await-in-loop
      await this.depotDonnees.ajouteContributeurAuService(nouvelleAutorisation);
      console.log(`Droit de propriété ajouté au service ${idService}`);
    }
    await this.supprimeUtilisateurParEmail(collaborateurParti.email);
  }

  async supprimeUtilisateurParEmail(email) {
    const utilisateur = await this.utilisateurAvecEmail(email);

    if (!utilisateur) {
      console.log(
        `L'utilisateur d'email ${email} n'existe pas. Rien n'a été supprimé.`
      );
      return;
    }

    if (await this.depotDonnees.estSuperviseur(utilisateur.id)) {
      await this.supprimeSupervisionDeUtilisateur(utilisateur.id);
    }

    const autorisations = await this.depotDonnees.autorisations(utilisateur.id);

    // eslint-disable-next-line no-restricted-syntax
    for (const autorisationExistante of autorisations) {
      // eslint-disable-next-line no-await-in-loop
      await this.depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService(
        utilisateur.id,
        autorisationExistante.idService
      );
      // eslint-disable-next-line no-await-in-loop
      await this.depotDonnees.supprimeContributeur(
        utilisateur.id,
        autorisationExistante.idService,
        'consoleAdmin'
      );
      console.log(
        `Autorisation supprimée pour le service ${autorisationExistante.idService}`
      );
    }

    await this.depotDonnees.supprimeUtilisateur(utilisateur.id);
    await adaptateurMail.supprimeContact(utilisateur.email);

    console.log(`Utilisateur ${utilisateur.email} supprimé`);
  }

  async supprimeSupervisionDeUtilisateur(idUtilisateur) {
    console.log(
      `Suppression des droits de supervision pour l'utilisateur ${idUtilisateur}`
    );

    const serviceSupervision = new ServiceSupervision({
      depotDonnees: this.depotDonnees,
      adaptateurSupervision: this.adaptateurSupervision,
    });

    await serviceSupervision.revoqueSuperviseur(idUtilisateur);
  }

  async ajouteSiretsAuSuperviseur(emailSuperviseur, sirets) {
    const superviseur =
      await this.depotDonnees.utilisateurAvecEmail(emailSuperviseur);
    if (!superviseur)
      throw new Error(
        `Impossible de trouve l'utilisateur avec l'email ${emailSuperviseur}`
      );

    const serviceSupervision = new ServiceSupervision({
      depotDonnees: this.depotDonnees,
      adaptateurSupervision: this.adaptateurSupervision,
    });

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-continue */
    for (const siret of sirets) {
      console.log(`Ajout du SIRET ${siret}`);
      try {
        await this.depotDonnees.ajouteSiretAuSuperviseur(superviseur.id, siret);
      } catch (e) {
        if (e.detail.includes('already exists')) {
          console.log(`Le superviseur supervise déjà le SIRET ${siret}`);
          continue;
        } else {
          throw e;
        }
      }

      const services = await this.depotDonnees.tousLesServicesAvecSiret(siret);

      console.log(`${services.length} services trouvés pour ce siret`);
      for (const s of services) {
        try {
          await serviceSupervision.relieServiceEtSuperviseurs(s);
        } catch (e) {
          console.warn(
            `Une erreur est survenu lors de la liaison du service ${s.id}`
          );
          console.warn(e);
        }
      }
    }
    /* eslint-enable no-restricted-syntax */
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-continue */
  }

  // eslint-disable-next-line class-methods-use-this
  async chiffreDonneesChaCha20() {
    const knex = Knex(configKnex.production);
    const { chiffre } = adaptateurChiffrementChaCha20({
      adaptateurEnvironnement,
    });

    await knex.transaction(async (trx) => {
      const utilisateurs = await trx('utilisateurs');

      const majUtilisateurs = utilisateurs.map(async ({ id, donnees }) => {
        const donneesChiffrees = await chiffre(donnees);
        return trx('utilisateurs')
          .where({ id })
          .update({ donnees: donneesChiffrees });
      });

      await Promise.all(majUtilisateurs);

      const services = await trx('services');

      const majServices = services.map(async ({ id, donnees }) => {
        const donneesChiffrees = await chiffre(donnees);
        return trx('services')
          .where({ id })
          .update({ donnees: donneesChiffrees });
      });

      await Promise.all(majServices);

      const televersementsServices = await trx('televersement_services');

      const majTeleversementsServices = televersementsServices.map(
        // eslint-disable-next-line camelcase
        async ({ id_utilisateur, donnees }) => {
          const donneesServicesChiffrees = await chiffre(donnees.services);
          return (
            trx('televersement_services')
              // eslint-disable-next-line camelcase
              .where({ id_utilisateur })
              .update({ donnees: { services: donneesServicesChiffrees } })
          );
        }
      );

      await Promise.all(majTeleversementsServices);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async dechiffreDonneesChaCha20() {
    const knex = Knex(configKnex.production);
    const { dechiffre } = adaptateurChiffrementChaCha20({
      adaptateurEnvironnement,
    });

    await knex.transaction(async (trx) => {
      const utilisateurs = await trx('utilisateurs');

      const majUtilisateurs = utilisateurs.map(async ({ id, donnees }) => {
        const donneesDechiffrees = await dechiffre(donnees);
        return trx('utilisateurs')
          .where({ id })
          .update({ donnees: donneesDechiffrees });
      });

      await Promise.all(majUtilisateurs);

      const services = await trx('services');

      const majServices = services.map(async ({ id, donnees }) => {
        const donneesDechiffrees = await dechiffre(donnees);
        return trx('services')
          .where({ id })
          .update({ donnees: donneesDechiffrees });
      });

      await Promise.all(majServices);

      const televersementsServices = await trx('televersement_services');

      const majTeleversementsServices = televersementsServices.map(
        // eslint-disable-next-line camelcase
        async ({ id_utilisateur, donnees }) => {
          const donneesServicesDechiffrees = await dechiffre(donnees.services);
          return (
            trx('televersement_services')
              // eslint-disable-next-line camelcase
              .where({ id_utilisateur })
              .update({ donnees: { services: donneesServicesDechiffrees } })
          );
        }
      );

      await Promise.all(majTeleversementsServices);
    });
  }

  async extraitResultatsParrainage(nombre = 30) {
    const knex = Knex(configKnex.production);
    const resultats = (
      await knex.raw(
        `
          SELECT id_utilisateur_parrain, COUNT(*) AS total_parrainages
          FROM parrainages
          WHERE filleul_a_finalise_compte = true
          GROUP BY id_utilisateur_parrain
          ORDER BY total_parrainages DESC LIMIT ?;
        `,
        [nombre]
      )
    ).rows;

    console.log('| Email | Nombre de parrainages |');
    console.log('| --- | --- |');
    // eslint-disable-next-line no-restricted-syntax
    for (const resultat of resultats) {
      // eslint-disable-next-line no-await-in-loop
      const parrain = await this.depotDonnees.utilisateur(
        resultat.id_utilisateur_parrain
      );
      console.log(`| ${parrain?.email} | ${resultat.total_parrainages} |`);
    }
  }

  async migreProfilsDansMPA() {
    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const utilisateursComplets = tousUtilisateurs
      .filter((u) => u.completudeProfil().estComplet)
      .filter((u) => u.postes && u.postes.length > 0)
      .filter(
        (u) => u.entite?.siret && u.entite?.nom?.trim() && u.entite?.departement
      );

    const utilisateursUniques = Array.from(
      new Map(utilisateursComplets.map((u) => [u.email, u])).values()
    );

    console.log(
      `${utilisateursUniques.length} utilisateurs avec profil complet`
    );
    const donneesProfils = utilisateursUniques.map((u) => ({
      dateInscription: u.dateCreation,
      donneesProfil: {
        email: u.email,
        nom: u.nom,
        prenom: u.prenom,
        organisation: {
          nom: u.entite.nom,
          siret: u.entite.siret,
          departement: u.entite.departement,
        },
        domainesSpecialite: u.postes,
        ...(u.telephone && { telephone: u.telephone }),
      },
    }));

    const adaptateurProfilAnssi = new AdaptateurProfilAnssi(
      process.env.PROFIL_ANSSI_URL_BASE,
      process.env.PROFIL_ANSSI_JETON_API
    );

    try {
      await adaptateurProfilAnssi.inscris(donneesProfils);
    } catch (e) {
      console.warn('Erreur lors de la migration');
      console.warn(e?.response?.data);
      return;
    }

    console.log('Migration effectuée');
  }

  // eslint-disable-next-line class-methods-use-this
  async rattrapageSuppressionSuggestionsActions() {
    const knex = Knex(configKnex.production);
    const nbSuppression = await knex('suggestions_actions')
      .whereNotIn('id_service', knex('services').select('id'))
      .del();
    console.log(`${nbSuppression} suggestions supprimées`);
  }

  async rattrapeEvenementsAcceptationCGU() {
    const knex = Knex(configKnex.production);
    const dateCreationParIdUtilisateur = Object.fromEntries(
      await knex('utilisateurs').then((tous) =>
        tous.map(({ id: idUtilisateur, date_creation: dateCreation }) => [
          idUtilisateur,
          new Date(dateCreation),
        ])
      )
    );

    const tousUtilisateurs = await this.depotDonnees.tousUtilisateurs();
    const utilisateursConfirmes = tousUtilisateurs.filter(
      (u) => !u.estUnInvite()
    );

    const afficheErreur = (utilisateur) => `Erreur pour ${utilisateur.email}`;

    const rattrapeUtilisateur = async (utilisateur) =>
      this.adaptateurJournalMSS.consigneEvenement(
        new EvenementCguAcceptees(
          {
            idUtilisateur: utilisateur.id,
            cguAcceptees: utilisateur.cguAcceptees,
          },
          { date: dateCreationParIdUtilisateur[utilisateur.id] }
        )
      );

    return ConsoleAdministration.rattrapage(
      utilisateursConfirmes,
      afficheErreur,
      rattrapeUtilisateur
    );
  }
}

export default ConsoleAdministration;
/* eslint-enable no-console */
