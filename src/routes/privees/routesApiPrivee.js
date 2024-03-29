const express = require('express');

const { valeurBooleenne } = require('../../utilitaires/aseptisation');
const { dateYYYYMMDD } = require('../../utilitaires/date');
const { zipTableaux } = require('../../utilitaires/tableau');
const {
  resultatValidation,
  valideMotDePasse,
} = require('../../http/validationMotDePasse');
const {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurModele,
} = require('../../erreurs');
const routesApiService = require('./routesApiService');
const Utilisateur = require('../../modeles/utilisateur');
const objetGetServices = require('../../modeles/objetsApi/objetGetServices');
const objetGetIndicesCyber = require('../../modeles/objetsApi/objetGetIndicesCyber');
const { DUREE_SESSION } = require('../../http/configurationServeur');
const {
  messageErreurDonneesUtilisateur,
  obtentionDonneesDeBaseUtilisateur,
} = require('../mappeur/utilisateur');
const {
  verifieCoherenceDesDroits,
} = require('../../modeles/autorisations/gestionDroits');

const routesApiPrivee = ({
  middleware,
  adaptateurMail,
  depotDonnees,
  referentiel,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurCsv,
  adaptateurZip,
  adaptateurJournalMSS,
  procedures,
  serviceAnnuaire,
}) => {
  const routes = express.Router();

  routes.get(
    '/services',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const services = await depotDonnees.homologations(
        requete.idUtilisateurCourant
      );
      const autorisations = await depotDonnees.autorisations(
        requete.idUtilisateurCourant
      );
      const donnees = objetGetServices.donnees(
        services,
        autorisations,
        referentiel
      );
      reponse.json(donnees);
    }
  );

  routes.get(
    '/services/indices-cyber',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const services = await depotDonnees.homologations(
        requete.idUtilisateurCourant
      );
      const autorisations = await depotDonnees.autorisations(
        requete.idUtilisateurCourant
      );
      const donnees = objetGetIndicesCyber.donnees(services, autorisations);
      reponse.json(donnees);
    }
  );

  routes.get(
    '/services/export.csv',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServices.*'),
    async (requete, reponse) => {
      const { idsServices = [] } = requete.query;

      const donneesCsvServices = (services, autorisations) => {
        const servicesSansIndice = objetGetServices.donnees(
          services,
          autorisations,
          referentiel
        );
        const indicesCyber = objetGetIndicesCyber.donnees(
          services,
          autorisations
        );

        return zipTableaux(
          servicesSansIndice.services,
          indicesCyber.services,
          'id'
        );
      };

      const autorisations = await depotDonnees.autorisations(
        requete.idUtilisateurCourant
      );

      const services = await depotDonnees.homologations(
        requete.idUtilisateurCourant
      );
      const donneesServices = donneesCsvServices(
        services.filter((service) => idsServices.includes(service.id)),
        autorisations
      );
      try {
        const buffer = await adaptateurCsv.genereCsvServices(donneesServices);
        const maintenantFormate = dateYYYYMMDD(adaptateurHorloge.maintenant());
        reponse
          .contentType('text/csv;charset=utf-8')
          .set(
            'Content-Disposition',
            `attachment; filename="MSS_services_${maintenantFormate}.csv"`
          )
          .send(buffer);
      } catch {
        reponse.sendStatus(424);
      }
    }
  );

  routes.use(
    '/service',
    routesApiService({
      middleware,
      depotDonnees,
      referentiel,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip,
      adaptateurJournalMSS,
    })
  );

  routes.put(
    '/motDePasse',
    middleware.aseptise('cguAcceptees', 'infolettreAcceptee'),
    async (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const cguDejaAcceptees = requete.cguAcceptees;
      const cguEnCoursDAcceptation = valeurBooleenne(requete.body.cguAcceptees);
      const infolettreAcceptee = valeurBooleenne(
        requete.body.infolettreAcceptee
      );
      const { motDePasse } = requete.body;

      if (!cguDejaAcceptees && !cguEnCoursDAcceptation) {
        reponse.status(422).send('CGU non acceptées');
        return;
      }

      if (
        valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE
      ) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      try {
        let u = await depotDonnees.utilisateur(idUtilisateur);
        await depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);
        u = await depotDonnees.valideAcceptationCGUPourUtilisateur(u);
        await depotDonnees.supprimeIdResetMotDePassePourUtilisateur(u);
        await adaptateurMail.inscrisEmailsTransactionnels(u.email);
        if (infolettreAcceptee) {
          await adaptateurMail.inscrisInfolettre(u.email);
          await depotDonnees.metsAJourUtilisateur(u.id, {
            infolettreAcceptee: true,
          });
        }
        requete.session.token = u.genereToken();
        reponse.json({ idUtilisateur });
      } catch (e) {
        suite(e);
      }
    }
  );

  routes.patch(
    '/motDePasse',
    middleware.challengeMotDePasse,
    async (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { motDePasse } = requete.body;

      const mdpInvalide =
        valideMotDePasse(motDePasse) !== resultatValidation.MOT_DE_PASSE_VALIDE;
      if (mdpInvalide) {
        reponse.status(422).send('Mot de passe trop simple');
        return;
      }

      const utilisateur = await depotDonnees.metsAJourMotDePasse(
        idUtilisateur,
        motDePasse
      );
      requete.session.token = utilisateur.genereToken();
      reponse.json({ idUtilisateur });
    }
  );

  routes.put(
    '/utilisateur',
    middleware.aseptise(
      ...Utilisateur.nomsProprietesBase().filter((nom) => nom !== 'email'),
      'nomEntite',
      'departementEntite'
    ),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const donnees = obtentionDonneesDeBaseUtilisateur(requete.body);
      const { donneesInvalides, messageErreur } =
        messageErreurDonneesUtilisateur(donnees, true, referentiel);

      if (donneesInvalides) {
        reponse
          .status(422)
          .send(
            `La mise à jour de l'utilisateur a échoué car les paramètres sont invalides. ${messageErreur}`
          );
        return;
      }

      depotDonnees
        .utilisateur(idUtilisateur)
        .then((utilisateur) =>
          utilisateur.changePreferencesCommunication(
            {
              infolettreAcceptee: donnees.infolettreAcceptee,
              transactionnelAccepte: donnees.transactionnelAccepte,
            },
            adaptateurMail
          )
        )
        .then(() => depotDonnees.metsAJourUtilisateur(idUtilisateur, donnees))
        .then(() => reponse.json({ idUtilisateur }))
        .catch(suite);
    }
  );

  routes.get('/utilisateurCourant', (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) => {
        reponse.json({
          utilisateur: {
            prenomNom: utilisateur.prenomNom(),
            profilEstComplet: utilisateur.profilEstComplet(),
          },
        });
      });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  routes.get('/dureeSession', (_requete, reponse) => {
    reponse.send({ dureeSession: DUREE_SESSION });
  });

  routes.post(
    '/autorisation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idServices.*', 'emailContributeur'),
    async (requete, reponse, suite) => {
      const { idServices = [], droits } = requete.body;
      const idUtilisateur = requete.idUtilisateurCourant;
      const emailContributeur = requete.body.emailContributeur?.toLowerCase();

      if (!verifieCoherenceDesDroits(droits)) {
        reponse.status(422).json({ erreur: { code: 'DROITS_INCOHERENTS' } });
        return;
      }

      const services = await Promise.all(
        idServices.map(depotDonnees.homologation)
      );
      const emetteur = await depotDonnees.utilisateur(idUtilisateur);

      try {
        await procedures.ajoutContributeurSurServices(
          emailContributeur,
          services,
          droits,
          emetteur
        );
        reponse.send('');
      } catch (e) {
        if (e instanceof EchecAutorisation)
          reponse.status(403).send("Ajout non autorisé d'un contributeur");
        else if (e instanceof ErreurAutorisationExisteDeja)
          reponse
            .status(422)
            .json({ erreur: { code: 'INVITATION_DEJA_ENVOYEE' } });
        else if (e instanceof EchecEnvoiMessage)
          reponse
            .status(424)
            .send("L'envoi de l'email de finalisation d'inscription a échoué");
        else if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
      }
    }
  );

  routes.delete(
    '/autorisation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idHomologation', 'idContributeur'),
    async (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { idHomologation: idService, idContributeur } = requete.query;

      const verifiePermissionSuppression = async () => {
        const a = await depotDonnees.autorisationPour(idUtilisateur, idService);
        if (!a.peutGererContributeurs()) throw new EchecAutorisation();
      };

      try {
        await verifiePermissionSuppression();
        await depotDonnees.supprimeContributeur(
          idContributeur,
          idService,
          idUtilisateur
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof EchecAutorisation)
          reponse
            .status(403)
            .send('Suppression non autorisé pour un contributeur');
        else reponse.status(424).send(e.message);

        suite(e);
      }
    }
  );

  routes.get('/nouvelleFonctionnalite/derniere', (_, reponse) => {
    const nouvelleFonctionnalite = referentiel.derniereNouvelleFonctionnalite(
      adaptateurHorloge.maintenant()
    );

    if (!nouvelleFonctionnalite) {
      reponse.status(404).send('Aucune dernière fonctionnalité');
      return;
    }

    reponse.json({ id: nouvelleFonctionnalite.id });
  });

  routes.get(
    '/nouvelleFonctionnalite/:id',
    middleware.aseptise('id'),
    (requete, reponse) => {
      const idNouvelleFonctionnalite = requete.params.id;
      const nouvelleFonctionnalite = referentiel.nouvelleFonctionnalite(
        idNouvelleFonctionnalite
      );

      if (!nouvelleFonctionnalite) {
        reponse.status(404).send('Nouvelle fonctionnalité inconnue');
        return;
      }

      reponse.render(
        `nouvellesFonctionnalites/${nouvelleFonctionnalite.fichierPug}`
      );
    }
  );

  routes.get(
    '/annuaire/contributeurs',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('recherche'),
    async (requete, reponse) => {
      const { recherche = '' } = requete.query;

      if (recherche === '') {
        reponse.status(400).send('Le terme de recherche ne peut pas être vide');
        return;
      }

      const contributeurs = await serviceAnnuaire.rechercheContributeurs(
        requete.idUtilisateurCourant,
        recherche
      );

      reponse.status(200).json({
        suggestions: contributeurs.map((c) => ({
          prenomNom: c.prenomNom(),
          email: c.email,
          initiales: c.initiales(),
        })),
      });
    }
  );

  return routes;
};

module.exports = routesApiPrivee;
