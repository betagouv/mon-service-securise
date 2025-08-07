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
  ErreurCategorieInconnue,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurJWTManquant,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurAutorisationInexistante,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurServiceInexistant,
} = require('../../erreurs');
const routesConnecteApiService = require('./routesConnecteApiService');
const Utilisateur = require('../../modeles/utilisateur');
const objetGetServices = require('../../modeles/objetsApi/objetGetServices');
const objetGetIndicesCyber = require('../../modeles/objetsApi/objetGetIndicesCyber');
const objetGetMesures = require('../../modeles/objetsApi/objetGetMesures');
const {
  messageErreurDonneesUtilisateur,
  obtentionDonneesDeBaseUtilisateur,
} = require('../mappeur/utilisateur');
const {
  verifieCoherenceDesDroits,
  Permissions,
  Rubriques,
} = require('../../modeles/autorisations/gestionDroits');
const routesConnecteApiVisiteGuidee = require('./routesConnecteApiVisiteGuidee');
const routesConnecteApiNotifications = require('./routesConnecteApiNotifications');
const SourceAuthentification = require('../../modeles/sourceAuthentification');
const {
  estNiveauDeSecuriteValide,
} = require('../../modeles/descriptionService');
const routesConnecteApiTeleversement = require('./routesConnecteApiTeleversement');

const { ECRITURE, LECTURE } = Permissions;
const { SECURISER } = Rubriques;

const routesConnecteApi = ({
  middleware,
  adaptateurMail,
  busEvenements,
  depotDonnees,
  referentiel,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurCsv,
  adaptateurZip,
  adaptateurJournal,
  lecteurDeFormData,
  adaptateurXLS,
  adaptateurJWT,
  procedures,
  serviceAnnuaire,
  serviceGestionnaireSession,
  serviceSupervision,
  serviceCgu,
}) => {
  const routes = express.Router();

  routes.get(
    '/services',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const services = await depotDonnees.services(
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
      const services = await depotDonnees.services(
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
    '/services/mesures',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const services = await depotDonnees.services(
        requete.idUtilisateurCourant
      );

      const autorisations = await depotDonnees.autorisations(
        requete.idUtilisateurCourant
      );

      const donnees = services
        .filter((s) =>
          autorisations
            .find((a) => a.idService === s.id)
            .aLesPermissions({ [SECURISER]: LECTURE })
        )
        .map((service) => {
          const { mesuresGenerales, mesuresSpecifiques } =
            objetGetMesures.donnees(service);

          const mesuresAssociees = Object.fromEntries(
            Object.entries(mesuresGenerales).map(
              ([idMesure, donneesMesure]) => {
                const { statut, modalites } = donneesMesure;
                return [
                  idMesure,
                  {
                    ...(statut && { statut }),
                    ...(modalites && { modalites }),
                  },
                ];
              }
            )
          );

          return {
            id: service.id,
            nomService: service.nomService(),
            organisationResponsable:
              service.descriptionService.organisationResponsable.nom,
            mesuresAssociees,
            mesuresSpecifiques,
            peutEtreModifie: autorisations
              .find((a) => a.idService === service.id)
              .aLesPermissions({ [SECURISER]: ECRITURE }),
            niveauSecurite: service.descriptionService.niveauSecurite,
            typeService: service.descriptionService.typeService,
          };
        });

      reponse.json(donnees);
    }
  );

  routes.put(
    '/services/mesuresGenerales/:id',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServices.*', 'id', 'statut', 'modalites'),
    async (requete, reponse) => {
      const { statut, modalites, idsServices } = requete.body;
      const { id } = requete.params;

      if (
        (!statut && !modalites) ||
        !referentiel.estIdentifiantMesureConnu(id)
      ) {
        reponse.sendStatus(400);
        return;
      }

      if (statut && !referentiel.estStatutMesureConnu(statut)) {
        reponse.sendStatus(400);
        return;
      }

      const aLesDroits = await depotDonnees.accesAutoriseAUneListeDeService(
        requete.idUtilisateurCourant,
        idsServices,
        { [SECURISER]: ECRITURE }
      );

      if (!aLesDroits) {
        reponse.sendStatus(403);
        return;
      }

      await depotDonnees.metsAJourMesureGeneraleDesServices(
        requete.idUtilisateurCourant,
        idsServices,
        id,
        statut,
        modalites
      );

      reponse.sendStatus(200);
    }
  );

  routes.put(
    '/services/mesuresSpecifiques/:idModele',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServices.*', 'idModele', 'statut', 'modalites'),
    async (requete, reponse) => {
      const { statut, modalites, idsServices } = requete.body;
      const { idModele } = requete.params;

      if (!statut && !modalites) {
        reponse.sendStatus(400);
        return;
      }

      const modelesExistants =
        await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
          requete.idUtilisateurCourant
        );
      if (!modelesExistants.some((m) => m.id === idModele)) {
        reponse.sendStatus(404);
        return;
      }

      if (statut && !referentiel.estStatutMesureConnu(statut)) {
        reponse.sendStatus(400);
        return;
      }

      const aLesDroits = await depotDonnees.accesAutoriseAUneListeDeService(
        requete.idUtilisateurCourant,
        idsServices,
        { [SECURISER]: ECRITURE }
      );

      if (!aLesDroits) {
        reponse.sendStatus(403);
        return;
      }

      await depotDonnees.metsAJourMesuresSpecifiquesDesServices(
        requete.idUtilisateurCourant,
        idsServices,
        idModele,
        statut,
        modalites
      );

      reponse.sendStatus(200);
    }
  );

  routes.get(
    '/services/export.csv',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServices.*'),
    async (requete, reponse) => {
      const { idsServices = [] } = requete.query;

      const mauvaisType =
        !Array.isArray(idsServices) && typeof idsServices !== 'string';
      if (mauvaisType) {
        reponse.sendStatus(400);
        return;
      }

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

      const services = await depotDonnees.services(
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
    routesConnecteApiService({
      middleware,
      depotDonnees,
      referentiel,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip,
      adaptateurJournal,
    })
  );

  routes.use(
    '/visiteGuidee',
    middleware.verificationAcceptationCGU,
    routesConnecteApiVisiteGuidee({
      middleware,
      depotDonnees,
      referentiel,
    })
  );

  routes.use(
    '/notifications',
    middleware.verificationAcceptationCGU,
    routesConnecteApiNotifications({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    })
  );

  routes.use(
    '/televersement',
    middleware.verificationAcceptationCGU,
    routesConnecteApiTeleversement({
      lecteurDeFormData,
      adaptateurXLS,
      busEvenements,
      depotDonnees,
      middleware,
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

        serviceGestionnaireSession.enregistreSession(
          requete,
          u,
          SourceAuthentification.MSS
        );

        reponse.json({ idUtilisateur });
      } catch (e) {
        suite(e);
      }
    }
  );

  routes.put('/utilisateur/acceptationCGU', async (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    let u = await depotDonnees.utilisateur(idUtilisateur);
    u = await depotDonnees.valideAcceptationCGUPourUtilisateur(u);

    serviceGestionnaireSession.enregistreSession(
      requete,
      u,
      requete.sourceAuthentification
    );

    reponse.sendStatus(200);
  });

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

      await depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse);
      reponse.json({ idUtilisateur });
    }
  );

  routes.put(
    '/utilisateur',
    middleware.aseptise(
      ...Utilisateur.nomsProprietesBase().filter(
        (propriete) => !['prenom', 'nom', 'email'].includes(propriete)
      ),
      'siretEntite'
    ),
    async (requete, reponse, suite) => {
      const { token } = requete.body;

      let donneesToken;
      try {
        donneesToken = await adaptateurJWT.decode(token);
      } catch (e) {
        const message =
          e instanceof ErreurJWTManquant
            ? 'Le token est requis'
            : 'Le token est invalide';
        reponse.status(422).send(message);
        return;
      }

      const idUtilisateur = requete.idUtilisateurCourant;
      const donnees = obtentionDonneesDeBaseUtilisateur(
        requete.body,
        serviceCgu
      );
      donnees.prenom = donneesToken.prenom;
      donnees.nom = donneesToken.nom;
      const { donneesInvalides, messageErreur } =
        messageErreurDonneesUtilisateur(donnees, true);

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
          sourceAuthentification: requete.sourceAuthentification,
          utilisateur: {
            prenomNom: utilisateur.prenomNom(),
          },
        });
      });
    } else reponse.status(401).send("Pas d'utilisateur courant");
  });

  routes.post(
    '/autorisation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idServices.*', 'emailContributeur'),
    async (requete, reponse, suite) => {
      const { idServices = [], droits } = requete.body;
      const idUtilisateur = requete.idUtilisateurCourant;
      const emailContributeur = requete.body.emailContributeur?.toLowerCase();

      if (!droits.estProprietaire) delete droits.estProprietaire;

      if (!verifieCoherenceDesDroits(droits)) {
        reponse.status(422).json({ erreur: { code: 'DROITS_INCOHERENTS' } });
        return;
      }

      const services = await Promise.all(idServices.map(depotDonnees.service));
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
    middleware.aseptise('idService', 'idContributeur'),
    async (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { idService, idContributeur } = requete.query;

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

  routes.get(
    '/supervision',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('filtreDate', 'filtreBesoinsSecurite', 'filtreEntite'),
    async (requete, reponse) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const estSuperviseur = await depotDonnees.estSuperviseur(idUtilisateur);
      if (!estSuperviseur) {
        reponse.sendStatus(401);
        return;
      }

      const { filtreDate, filtreBesoinsSecurite, filtreEntite } = requete.query;

      if (filtreDate && !referentiel.estOptionFiltrageDateConnue(filtreDate)) {
        reponse.sendStatus(400);
        return;
      }
      if (
        filtreBesoinsSecurite &&
        !estNiveauDeSecuriteValide(filtreBesoinsSecurite)
      ) {
        reponse.sendStatus(400);
        return;
      }

      const urlSupervision = serviceSupervision.genereURLSupervision(
        idUtilisateur,
        { filtreDate, filtreBesoinsSecurite, filtreEntite }
      );

      reponse.status(200).json({ urlSupervision });
    }
  );

  routes.get(
    '/referentiel/mesures',
    middleware.verificationAcceptationCGU,
    async (_requete, reponse) => {
      reponse.json(referentiel.mesures());
    }
  );

  routes.get(
    '/modeles/mesureSpecifique',
    middleware.verificationAcceptationCGU,
    async (requete, reponse) => {
      const modeles =
        await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
          requete.idUtilisateurCourant
        );

      reponse.json(modeles);
    }
  );

  routes.post(
    '/modeles/mesureSpecifique',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('description', 'descriptionLongue', 'categorie'),
    async (requete, reponse) => {
      const { categorie, description, descriptionLongue } = requete.body;

      try {
        referentiel.verifieCategoriesMesuresSontRepertoriees([categorie]);
      } catch (e) {
        if (e instanceof ErreurCategorieInconnue) {
          reponse.status(400).send('La catégorie est invalide');
          return;
        }
      }
      if (!description) {
        reponse.status(400).send('La description est obligatoire');
        return;
      }

      const idModele = await depotDonnees.ajouteModeleMesureSpecifique(
        requete.idUtilisateurCourant,
        { description, descriptionLongue, categorie }
      );

      reponse.status(201).send({ id: idModele });
    }
  );

  routes.put(
    '/modeles/mesureSpecifique/:id',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('description', 'descriptionLongue', 'categorie'),
    async (requete, reponse) => {
      const idModele = requete.params.id;
      const { categorie, description, descriptionLongue } = requete.body;

      const modelesMesureDeUtilisateur =
        await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
          requete.idUtilisateurCourant
        );
      const modele = modelesMesureDeUtilisateur.find((m) => m.id === idModele);
      if (!modele) {
        reponse.sendStatus(404);
        return;
      }

      try {
        referentiel.verifieCategoriesMesuresSontRepertoriees([categorie]);
      } catch (e) {
        if (e instanceof ErreurCategorieInconnue) {
          reponse.status(400).send('La catégorie est invalide');
          return;
        }
      }
      if (!description) {
        reponse.status(400).send('La description est obligatoire');
        return;
      }

      await depotDonnees.metsAJourModeleMesureSpecifique(
        requete.idUtilisateurCourant,
        idModele,
        {
          categorie,
          description,
          descriptionLongue,
        }
      );

      reponse.sendStatus(200);
    }
  );

  routes.delete(
    '/modeles/mesureSpecifique/:id',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('detacheMesures'),
    async (requete, reponse) => {
      try {
        if (requete.query.detacheMesures === 'true') {
          await depotDonnees.supprimeModeleMesureSpecifiqueEtDetacheMesuresAssociees(
            requete.idUtilisateurCourant,
            requete.params.id
          );
        } else {
          await depotDonnees.supprimeModeleMesureSpecifiqueEtMesuresAssociees(
            requete.idUtilisateurCourant,
            requete.params.id
          );
        }
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurModeleDeMesureSpecifiqueIntrouvable) {
          reponse.sendStatus(404);
          return;
        }
        if (
          e instanceof ErreurAutorisationInexistante ||
          e instanceof ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        ) {
          reponse.sendStatus(403);
          return;
        }
        throw e;
      }
    }
  );

  routes.put(
    '/modeles/mesureSpecifique/:id/services',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServicesAAssocier.*'),
    async (requete, reponse) => {
      const { id: idModele } = requete.params;
      const { idsServicesAAssocier } = requete.body;

      const modelesMesureDeUtilisateur =
        await depotDonnees.lisModelesMesureSpecifiquePourUtilisateur(
          requete.idUtilisateurCourant
        );
      const modele = modelesMesureDeUtilisateur.find((m) => m.id === idModele);
      if (!modele) {
        reponse.sendStatus(404);
        return;
      }
      try {
        await depotDonnees.associeModeleMesureSpecifiqueAuxServices(
          idModele,
          idsServicesAAssocier,
          requete.idUtilisateurCourant
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurModeleDeMesureSpecifiqueDejaAssociee) {
          reponse.sendStatus(400);
          return;
        }
        throw e;
      }
    }
  );

  routes.delete(
    '/modeles/mesureSpecifique/:id/services',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('idsServices.*'),
    async (requete, reponse) => {
      try {
        await depotDonnees.supprimeDesMesuresAssocieesAuModele(
          requete.idUtilisateurCourant,
          requete.params.id,
          requete.body.idsServices
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurModeleDeMesureSpecifiqueIntrouvable) {
          reponse.sendStatus(404);
          return;
        }
        if (
          e instanceof ErreurAutorisationInexistante ||
          e instanceof ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        ) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof ErreurServiceInexistant) {
          reponse.sendStatus(400);
          return;
        }
        throw e;
      }
    }
  );

  return routes;
};

module.exports = routesConnecteApi;
