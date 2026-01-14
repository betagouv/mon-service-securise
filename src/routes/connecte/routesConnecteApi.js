import { z } from 'zod';
import express from 'express';
import { dateYYYYMMDD } from '../../utilitaires/date.js';
import { zipTableaux } from '../../utilitaires/tableau.js';
import {
  resultatValidation,
  valideMotDePasse,
} from '../../http/validationMotDePasse.js';
import {
  EchecAutorisation,
  EchecEnvoiMessage,
  ErreurAutorisationExisteDeja,
  ErreurModele,
} from '../../erreurs.js';
import routesConnecteApiService from './routesConnecteApiService.js';
import * as objetGetServices from '../../modeles/objetsApi/objetGetServices.js';
import * as objetGetIndicesCyber from '../../modeles/objetsApi/objetGetIndicesCyber.js';
import * as objetGetMesures from '../../modeles/objetsApi/objetGetMesures.js';
import {
  messageErreurDonneesUtilisateur,
  obtentionDonneesDeBaseUtilisateur,
} from '../mappeur/utilisateur.js';
import {
  Permissions,
  Rubriques,
  verifieCoherenceDesDroits,
} from '../../modeles/autorisations/gestionDroits.js';
import routesConnecteApiVisiteGuidee from './routesConnecteApiVisiteGuidee.js';
import routesConnecteApiNotifications from './routesConnecteApiNotifications.js';
import { SourceAuthentification } from '../../modeles/sourceAuthentification.js';
import routesConnecteApiTeleversement from './routesConnecteApiTeleversement.js';
import routesConnecteApiBrouillonService from './routesConnecteApiBrouillonService.js';
import routesConnecteApiServiceV2 from './routesConnecteApiServiceV2.js';
import { routesConnecteApiExplicationNouveauReferentiel } from './routesConnecteApiExplicationNouveauReferentiel.js';
import { VersionService } from '../../modeles/versionService.js';
import { mesuresV2 } from '../../../donneesReferentielMesuresV2.js';
import {
  valideBody,
  valideParams,
  valideQuery,
} from '../../http/validePayloads.js';
import {
  schemaDeleteAutorisation,
  schemaPatchMotDePasse,
  schemaPostAutorisation,
  schemaPutMesureGenerale,
  schemaPutMesuresSpecifiques,
  schemaPutMotDePasse,
  schemaPutUtilisateur,
} from './routesConnecteApi.schema.js';
import { schemaMesureGenerale } from '../../http/schemas/mesure.schema.js';
import routesConnecteApiModeleMesureSpecifique from './routesConnecteApiModeleMesureSpecifique.js';

const { ECRITURE, LECTURE } = Permissions;
const { SECURISER } = Rubriques;

const routesConnecteApi = ({
  middleware,
  adaptateurMail,
  busEvenements,
  depotDonnees,
  referentiel,
  referentielV2,
  adaptateurHorloge,
  adaptateurPdf,
  adaptateurCsv,
  adaptateurZip,
  adaptateurJournal,
  lecteurDeFormData,
  adaptateurEnvironnement,
  adaptateurTeleversementServices,
  adaptateurTeleversementModelesMesureSpecifique,
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
      const { idUtilisateurCourant } = requete;

      const services = await depotDonnees.services(idUtilisateurCourant);
      const autorisations =
        await depotDonnees.autorisations(idUtilisateurCourant);

      const donneesServices = objetGetServices.donnees(
        services,
        autorisations,
        referentiel,
        adaptateurEnvironnement
      );

      const brouillonsService =
        await depotDonnees.lisBrouillonsService(idUtilisateurCourant);

      reponse.json({ ...donneesServices, brouillonsService });
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
    valideParams(
      z.strictObject({
        id: schemaMesureGenerale.id(referentiel, referentielV2),
      })
    ),
    valideBody(
      z.strictObject(schemaPutMesureGenerale(referentiel, referentielV2))
    ),
    async (requete, reponse) => {
      const { statut, modalites, idsServices, version } = requete.body;
      const { id } = requete.params;

      const referentielCible =
        version === VersionService.v1 ? referentiel : referentielV2;

      if (
        (!statut && !modalites) ||
        !referentielCible.estIdentifiantMesureConnu(id)
      ) {
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
        modalites,
        version
      );

      reponse.sendStatus(200);
    }
  );

  routes.put(
    '/services/mesuresSpecifiques/:idModele',
    middleware.verificationAcceptationCGU,
    valideParams(z.strictObject({ idModele: z.uuid() })),
    valideBody(
      z.strictObject(schemaPutMesuresSpecifiques(referentiel, referentielV2))
    ),
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
          referentiel,
          adaptateurEnvironnement
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
      referentielV2,
      adaptateurHorloge,
      adaptateurPdf,
      adaptateurZip,
      adaptateurJournal,
    })
  );

  routes.use(
    '/brouillon-service',
    middleware.verificationAcceptationCGU,
    routesConnecteApiBrouillonService({ depotDonnees })
  );

  routes.use(
    '/service-v2',
    middleware.verificationAcceptationCGU,
    routesConnecteApiServiceV2({ middleware, depotDonnees })
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
    '/explicationNouveauReferentiel',
    middleware.verificationAcceptationCGU,
    routesConnecteApiExplicationNouveauReferentiel({
      depotDonnees,
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
      adaptateurTeleversementServices,
      adaptateurTeleversementModelesMesureSpecifique,
      busEvenements,
      depotDonnees,
      middleware,
    })
  );

  routes.use(
    '/modeles/mesureSpecifique',
    middleware.verificationAcceptationCGU,
    routesConnecteApiModeleMesureSpecifique({
      depotDonnees,
      referentiel,
      referentielV2,
    })
  );

  routes.put(
    '/motDePasse',
    valideBody(z.strictObject(schemaPutMotDePasse())),
    async (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const cguDejaAcceptees = requete.cguAcceptees;
      const {
        motDePasse,
        infolettreAcceptee,
        cguAcceptees: cguEnCoursDAcceptation,
      } = requete.body;

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
    valideBody(z.strictObject(schemaPatchMotDePasse())),
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
    valideBody(z.strictObject(schemaPutUtilisateur)),
    (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const donnees = obtentionDonneesDeBaseUtilisateur(
        requete.body,
        serviceCgu
      );
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
    valideBody(z.strictObject(schemaPostAutorisation())),
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
    valideQuery(z.strictObject(schemaDeleteAutorisation())),
    async (requete, reponse, suite) => {
      const idUtilisateur = requete.idUtilisateurCourant;
      const { idService, idContributeur } = requete.query;

      const verifiePermissionSuppression = async () => {
        const a = await depotDonnees.autorisationPour(idUtilisateur, idService);
        if (!a.peutGererContributeurs()) throw new EchecAutorisation();
      };

      try {
        await verifiePermissionSuppression();
        await depotDonnees.dissocieTousModelesMesureSpecifiqueDeUtilisateurSurService(
          idContributeur,
          idService
        );
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
        !referentiel.estNiveauDeSecuriteValide(filtreBesoinsSecurite)
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
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete;

      const versions =
        await depotDonnees.versionsServiceUtiliseesParUtilisateur(
          idUtilisateurCourant
        );

      const ajouteVersion = (versionReferentiel, mesuresParId) =>
        Object.fromEntries(
          Object.entries(mesuresParId).map(([id, mesure]) => [
            id,
            { ...mesure, versionReferentiel },
          ])
        );

      let mesuresInteressantes = {};

      if (versions.includes(VersionService.v1) || versions.length === 0)
        mesuresInteressantes = ajouteVersion(
          VersionService.v1,
          referentiel.mesures()
        );

      if (versions.includes(VersionService.v2))
        mesuresInteressantes = {
          ...mesuresInteressantes,
          ...ajouteVersion(VersionService.v2, mesuresV2),
        };

      reponse.json(mesuresInteressantes);
    }
  );

  return routes;
};

export default routesConnecteApi;
