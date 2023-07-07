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
const ServiceTracking = require('../../tracking/serviceTracking');
const Utilisateur = require('../../modeles/utilisateur');
const objetGetServices = require('../../modeles/objetsApi/objetGetServices');
const objetGetIndicesCyber = require('../../modeles/objetsApi/objetGetIndicesCyber');
const { DUREE_SESSION } = require('../../http/configurationServeur');
const {
  messageErreurDonneesUtilisateur,
  obtentionDonneesDeBaseUtilisateur,
} = require('../mappeur/utilisateur');

const routesApiPrivee = ({
  middleware,
  adaptateurMail,
  depotDonnees,
  referentiel,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurCsv,
  adaptateurZip,
  adaptateurTracking,
}) => {
  const verifieSuccesEnvoiMessage = (promesseEnvoiMessage, utilisateur) =>
    promesseEnvoiMessage
      .then(() => utilisateur)
      .catch(() =>
        depotDonnees
          .supprimeUtilisateur(utilisateur.id)
          .then(() => Promise.reject(new EchecEnvoiMessage()))
      );

  const envoieMessageInvitationInscription = (
    emetteur,
    contributeur,
    service
  ) =>
    verifieSuccesEnvoiMessage(
      adaptateurMail.envoieMessageInvitationInscription(
        contributeur.email,
        emetteur.prenomNom(),
        service.nomService(),
        contributeur.idResetMotDePasse
      ),
      contributeur
    );

  const envoieMessageInvitationContribution = (
    emetteur,
    contributeur,
    service
  ) =>
    adaptateurMail
      .envoieMessageInvitationContribution(
        contributeur.email,
        emetteur.prenomNom(),
        service.nomService(),
        service.id
      )
      .then(() => contributeur);

  const routes = express.Router();

  routes.get(
    '/services',
    middleware.verificationAcceptationCGU,
    (requete, reponse) => {
      depotDonnees
        .homologations(requete.idUtilisateurCourant)
        .then((services) =>
          objetGetServices.donnees(
            services,
            requete.idUtilisateurCourant,
            referentiel
          )
        )
        .then((donnees) => reponse.json(donnees));
    }
  );

  routes.get(
    '/services/indices-cyber',
    middleware.verificationAcceptationCGU,
    (requete, reponse) => {
      depotDonnees
        .homologations(requete.idUtilisateurCourant)
        .then((services) => objetGetIndicesCyber.donnees(services))
        .then((donnees) => reponse.json(donnees));
    }
  );

  routes.get(
    '/services/export.csv',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServices.*'),
    (requete, reponse) => {
      const { idsServices = [] } = requete.query;

      const donneesCsvServices = (services) => {
        const servicesSansIndice = objetGetServices.donnees(
          services,
          requete.idUtilisateurCourant,
          referentiel
        );
        const indicesCyber = objetGetIndicesCyber.donnees(services);

        return zipTableaux(
          servicesSansIndice.services,
          indicesCyber.services,
          'id'
        );
      };

      depotDonnees
        .homologations(requete.idUtilisateurCourant)
        .then((services) =>
          services.filter((service) => idsServices.includes(service.id))
        )
        .then((services) => donneesCsvServices(services))
        .then((donneesServices) =>
          adaptateurCsv.genereCsvServices(donneesServices)
        )
        .then((buffer) => {
          const maintenantFormate = dateYYYYMMDD(
            adaptateurHorloge.maintenant()
          );
          reponse
            .contentType('text/csv;charset=utf-8')
            .set(
              'Content-Disposition',
              `attachment; filename="MSS_services_${maintenantFormate}.csv"`
            )
            .send(buffer);
        })
        .catch(() => reponse.sendStatus(424));
    }
  );

  routes.use(
    '/service',
    routesApiService(
      middleware,
      depotDonnees,
      referentiel,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip
    )
  );

  routes.get(
    '/seuilCriticite',
    middleware.verificationAcceptationCGU,
    (requete, reponse) => {
      const {
        fonctionnalites = [],
        donneesCaracterePersonnel = [],
        delaiAvantImpactCritique,
      } = requete.query;
      try {
        const seuilCriticite = referentiel.criticite(
          fonctionnalites,
          donneesCaracterePersonnel,
          delaiAvantImpactCritique
        );
        reponse.json({ seuilCriticite });
      } catch {
        reponse.status(422).send('Données invalides');
      }
    }
  );

  routes.put(
    '/motDePasse',
    middleware.aseptise('cguAcceptees'),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const cguDejaAcceptees = requete.cguAcceptees;
      const cguEnCoursDAcceptation = valeurBooleenne(requete.body.cguAcceptees);
      const { motDePasse } = requete.body;

      const pasDeMotDePasse = motDePasse === undefined;
      if (pasDeMotDePasse) {
        reponse.status(204).send();
        return;
      }

      const motDePasseInvalide = !(
        typeof motDePasse === 'string' && motDePasse
      );
      if (motDePasseInvalide) {
        reponse.status(422).send('Mot de passe invalide');
        return;
      }

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

      depotDonnees
        .metsAJourMotDePasse(idUtilisateur, motDePasse)
        .then(depotDonnees.valideAcceptationCGUPourUtilisateur)
        .then(depotDonnees.supprimeIdResetMotDePassePourUtilisateur)
        .then((utilisateur) => {
          requete.session.token = utilisateur.genereToken();
          reponse.json({ idUtilisateur });
        })
        .catch(suite);
    }
  );

  routes.put(
    '/utilisateur',
    middleware.aseptise([
      ...Utilisateur.nomsProprietesBase().filter((nom) => nom !== 'email'),
    ]),
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
        .then((utilisateur) => {
          const acceptationInfolettreActuelle = utilisateur.infolettreAcceptee;
          const nouvelleAcceptationInfolettre = donnees.infolettreAcceptee;
          const doitInscrire =
            !acceptationInfolettreActuelle && nouvelleAcceptationInfolettre;
          const doitDesinscrire =
            acceptationInfolettreActuelle && !nouvelleAcceptationInfolettre;

          if (doitInscrire)
            return adaptateurMail.inscrisInfolettre(utilisateur.email);
          if (doitDesinscrire)
            return adaptateurMail.desinscrisInfolettre(utilisateur.email);
          return Promise.resolve();
        })
        .then(() => depotDonnees.metsAJourUtilisateur(idUtilisateur, donnees))
        .then(() => reponse.json({ idUtilisateur }))
        .catch(suite);
    }
  );

  routes.get('/utilisateurCourant', (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur).then((utilisateur) => {
        reponse.json({ utilisateur: utilisateur.toJSON() });
      });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  routes.get('/dureeSession', (_requete, reponse) => {
    reponse.send({ dureeSession: DUREE_SESSION });
  });

  routes.post(
    '/autorisation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idHomologation', 'emailContributeur'),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { idHomologation } = requete.body;
      const emailContributeur = requete.body.emailContributeur?.toLowerCase();

      const verifiePermission = (...params) =>
        depotDonnees
          .autorisationPour(...params)
          .then((a) =>
            a.permissionAjoutContributeur
              ? Promise.resolve()
              : Promise.reject(new EchecAutorisation())
          );

      const verifieAutorisationInexistante = (...params) =>
        depotDonnees
          .autorisationExiste(...params)
          .then((existe) =>
            existe
              ? Promise.reject(
                  new ErreurAutorisationExisteDeja("L'autorisation existe déjà")
                )
              : Promise.resolve()
          );

      const creeContributeurSiNecessaire = (contributeurExistant) =>
        contributeurExistant
          ? Promise.resolve(contributeurExistant)
          : depotDonnees
              .nouvelUtilisateur({
                email: emailContributeur,
                infolettreAcceptee: false,
              })
              .then((utilisateur) =>
                adaptateurMail
                  .creeContact(emailContributeur, '', '', true)
                  .then(() => utilisateur)
              );

      const informeContributeur = (
        contributeurAInformer,
        contributeurExistant
      ) =>
        Promise.all([
          depotDonnees.utilisateur(idUtilisateur),
          depotDonnees.homologation(idHomologation),
        ]).then(([emetteur, service]) =>
          contributeurExistant
            ? envoieMessageInvitationContribution(
                emetteur,
                contributeurAInformer,
                service
              )
            : envoieMessageInvitationInscription(
                emetteur,
                contributeurAInformer,
                service
              )
        );

      const inviteContributeur = (contributeurExistant) =>
        verifieAutorisationInexistante(contributeurExistant?.id, idHomologation)
          .then(() =>
            creeContributeurSiNecessaire(contributeurExistant, idHomologation)
          )
          .then((c) => informeContributeur(c, contributeurExistant));

      verifiePermission(idUtilisateur, idHomologation)
        .then(() => depotDonnees.utilisateurAvecEmail(emailContributeur))
        .then(inviteContributeur)
        .then((c) =>
          depotDonnees.ajouteContributeurAHomologation(c.id, idHomologation)
        )
        .then(() => {
          ServiceTracking.creeService()
            .nombreMoyenContributeursPourUtilisateur(
              depotDonnees,
              idUtilisateur
            )
            .then((nombreMoyenContributeurs) =>
              adaptateurTracking.envoieTrackingInvitationContributeur(
                emailContributeur,
                { nombreMoyenContributeurs }
              )
            );
        })
        .then(() => reponse.send(''))
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse.status(403).send("Ajout non autorisé d'un contributeur");
          } else if (e instanceof ErreurAutorisationExisteDeja) {
            reponse
              .status(422)
              .json({ erreur: { code: 'INVITATION_DEJA_ENVOYEE' } });
          } else if (e instanceof EchecEnvoiMessage) {
            reponse
              .status(424)
              .send(
                "L'envoi de l'email de finalisation d'inscription a échoué"
              );
          } else if (e instanceof ErreurModele)
            reponse.status(422).send(e.message);
          else suite(e);
        });
    }
  );

  routes.delete(
    '/autorisation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idHomologation', 'idContributeur'),
    (requete, reponse, suite) => {
      const verifiePermissionSuppression = (...params) =>
        depotDonnees
          .autorisationPour(...params)
          .then((a) =>
            a.permissionSuppressionContributeur
              ? Promise.resolve()
              : Promise.reject(new EchecAutorisation())
          );

      const idUtilisateur = requete.idUtilisateurCourant;
      const { idHomologation, idContributeur } = requete.query;

      verifiePermissionSuppression(idUtilisateur, idHomologation)
        .then(() => {
          depotDonnees
            .supprimeContributeur(idContributeur, idHomologation)
            .then(() => reponse.sendStatus(200))
            .catch((e) => {
              reponse.status(424).send(e.message);
            });
        })
        .catch((e) => {
          if (e instanceof EchecAutorisation) {
            reponse
              .status(403)
              .send('Suppression non autorisé pour un contributeur');
          }
          suite(e);
        });
    }
  );

  return routes;
};

module.exports = routesApiPrivee;
