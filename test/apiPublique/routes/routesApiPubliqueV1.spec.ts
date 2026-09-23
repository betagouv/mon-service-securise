import request from 'supertest';
import { creeServeurApiPublique } from '../../../src/apiPublique/mssApiPublique.js';
import { depotVide } from '../../depots/depotVide.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import { schemaReponseServices } from '../../../src/apiPublique/schemas/services.schema.ts';
import { schemaReponseIndiceCyber } from '../../../src/apiPublique/schemas/indiceCyber.schema.ts';
import { schemaReponseMesures } from '../../../src/apiPublique/schemas/mesures.schema.ts';
import { schemaReponseHomologation } from '../../../src/apiPublique/schemas/homologation.schema.ts';
import { schemaReponseRisques } from '../../../src/apiPublique/schemas/risques.schema.ts';
import Risques from '../../../src/modeles/risques.ts';
import { RisquesV2 } from '../../../src/moteurRisques/v2/risquesV2.ts';
import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';
import { RisqueSpecifiqueV2 } from '../../../src/moteurRisques/v2/risqueSpecifiqueV2.ts';
import { AdaptateurEnvironnement } from '../../../src/adaptateurs/adaptateurEnvironnement.interface.ts';
import Mesures from '../../../src/modeles/mesures.js';
import { creeReferentiel } from '../../../src/referentiel.ts';
import {
  Permissions,
  Rubriques,
  tousDroitsEnLecture,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { AdaptateurGestionErreur } from '../../../src/adaptateurs/adaptateurGestionErreur.interface.ts';

const { LECTURE, INVISIBLE } = Permissions;
const { DECRIRE, SECURISER, HOMOLOGUER, RISQUES } = Rubriques;

describe("Les routes d'API publique `/v1`", () => {
  let depotDonnees: DepotDonnees;
  let enTeteAuthorization: string;
  let avecRisquesV2: boolean;

  beforeEach(async () => {
    avecRisquesV2 = false;
    depotDonnees = await depotVide();
    const { valeurEnClair } = await depotDonnees.nouvelleCle(unUUID('U'), 30);
    enTeteAuthorization = `Bearer ${valeurEnClair}`;
  });

  const uneApp = () =>
    creeServeurApiPublique({
      depotDonnees,
      urlBaseMss: 'https://mss.example.org',
      adaptateurGestionErreur: {
        logueErreur: () => {},
      } as unknown as AdaptateurGestionErreur,
      adaptateurAuditApiPublique: { trace: async () => {} },
      adaptateurEnvironnement: {
        featureFlag: () => ({ avecRisquesV2: () => avecRisquesV2 }),
      } as unknown as AdaptateurEnvironnement,
    }).app;

  const unServiceDeLyon = () =>
    unServiceV2()
      .avecId(unUUID('S'))
      .avecNomService("Téléservice de demande d'aide")
      .avecOrganisationResponsable({
        nom: 'Ville de Lyon',
        siret: '21690123400015',
        departement: '69',
      })
      .avecNContributeurs(4)
      .construis();

  describe('sur GET /v1/services', () => {
    it("exige une clé d'API", async () => {
      const reponse = await request(uneApp()).get('/v1/services');

      expect(reponse.status).toBe(401);
    });

    it("renvoie les services de l'utilisateur à qui appartient la clé", async () => {
      depotDonnees.services = async () => [unServiceDeLyon()];
      depotDonnees.autorisations = async () => [
        uneAutorisation()
          .deContributeur(unUUID('U'), unUUID('S'))
          .avecDroits({ [DECRIRE]: LECTURE })
          .construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        donnees: [
          {
            id: unUUID('S'),
            nom: "Téléservice de demande d'aide",
            organisationResponsable: {
              nom: 'Ville de Lyon',
              siret: '21690123400015',
            },
            nombreContributeurs: 4,
            niveauSecurite: 'niveau3',
          },
        ],
      });
    });

    it('renvoie une réponse conforme au schéma documenté', async () => {
      const idService = unUUIDRandom();
      depotDonnees.services = async () => [
        unServiceV2().avecId(idService).construis(),
      ];
      depotDonnees.autorisations = async () => [
        uneAutorisation()
          .deContributeur(unUUID('U'), idService)
          .avecDroits({ [DECRIRE]: LECTURE })
          .construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(schemaReponseServices.safeParse(reponse.body).success).toBe(true);
    });

    it("renvoie `null` pour le nom et le SIRET de l'organisation quand ils ne sont pas renseignés", async () => {
      depotDonnees.services = async () => [
        unServiceV2()
          .avecId(unUUID('S'))
          .avecOrganisationResponsable({})
          .construis(),
      ];
      depotDonnees.autorisations = async () => [
        uneAutorisation().deContributeur(unUUID('U'), unUUID('S')).construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.body.donnees[0].organisationResponsable).toEqual({
        nom: null,
        siret: null,
      });
    });

    it("n'expose pas le niveau de sécurité sans le droit de lire la description du service", async () => {
      depotDonnees.services = async () => [unServiceDeLyon()];
      depotDonnees.autorisations = async () => [
        uneAutorisation()
          .deContributeur(unUUID('U'), unUUID('S'))
          .avecDroits({ [DECRIRE]: INVISIBLE })
          .construis(),
      ];

      const reponse = await request(uneApp())
        .get('/v1/services')
        .set('Authorization', enTeteAuthorization);

      expect(reponse.body.donnees[0]).not.toHaveProperty('niveauSecurite');
    });
  });

  describe("sur les routes d'un service", () => {
    const routesDUnService = [
      { route: 'indice-cyber', rubriqueRequise: SECURISER },
      { route: 'mesures', rubriqueRequise: SECURISER },
      { route: 'homologation', rubriqueRequise: HOMOLOGUER },
      { route: 'risques', rubriqueRequise: RISQUES },
    ];

    let idService: UUID;

    beforeEach(() => {
      idService = unUUIDRandom();
      depotDonnees.service = async () =>
        unServiceV2().avecId(idService).construis();
      depotDonnees.autorisationPour = async () =>
        uneAutorisation()
          .deContributeur(unUUID('U'), idService)
          .avecTousDroitsEcriture()
          .construis();
    });

    describe.each(routesDUnService)(
      'sur GET /v1/services/:id/$route',
      ({ route, rubriqueRequise }) => {
        it("exige une clé d'API", async () => {
          const reponse = await request(uneApp()).get(
            `/v1/services/${idService}/${route}`
          );

          expect(reponse.status).toBe(401);
        });

        it("renvoie une erreur 404 si l'utilisateur n'a pas accès au service", async () => {
          depotDonnees.autorisationPour = async () => undefined;

          const reponse = await request(uneApp())
            .get(`/v1/services/${idService}/${route}`)
            .set('Authorization', enTeteAuthorization);

          expect(reponse.status).toBe(404);
          expect(reponse.body).toEqual({ erreur: 'RESSOURCE_INEXISTANTE' });
        });

        it(`renvoie une erreur 403 sans le droit de lire la rubrique ${rubriqueRequise}`, async () => {
          depotDonnees.autorisationPour = async () =>
            uneAutorisation()
              .deContributeur(unUUID('U'), idService)
              .avecDroits({
                ...tousDroitsEnLecture(),
                [rubriqueRequise]: INVISIBLE,
              })
              .construis();

          const reponse = await request(uneApp())
            .get(`/v1/services/${idService}/${route}`)
            .set('Authorization', enTeteAuthorization);

          expect(reponse.status).toBe(403);
          expect(reponse.body).toEqual({ erreur: 'DROITS_INSUFFISANTS' });
        });
      }
    );

    describe('sur GET /v1/services/:id/indice-cyber', () => {
      beforeEach(() => {
        const service = unServiceV2().avecId(idService).construis();
        service.indiceCyber = () => ({
          total: 3.4444,
          gouvernance: 4.16,
          protection: 3.1,
          defense: 2.849,
          resilience: 3.6,
        });
        depotDonnees.service = async () => service;
      });

      it("renvoie l'indice cyber du service, arrondi à une décimale", async () => {
        const reponse = await request(uneApp())
          .get(`/v1/services/${idService}/indice-cyber`)
          .set('Authorization', enTeteAuthorization);

        expect(reponse.status).toBe(200);
        expect(reponse.body).toEqual({
          noteMax: 5,
          total: 3.4,
          parCategorie: {
            gouvernance: 4.2,
            protection: 3.1,
            defense: 2.8,
            resilience: 3.6,
          },
        });
      });

      it('renvoie une réponse conforme au schéma documenté', async () => {
        const reponse = await request(uneApp())
          .get(`/v1/services/${idService}/indice-cyber`)
          .set('Authorization', enTeteAuthorization);

        expect(schemaReponseIndiceCyber.safeParse(reponse.body).success).toBe(
          true
        );
      });
    });

    describe('sur GET /v1/services/:id/mesures', () => {
      const idMesureSpecifique = unUUIDRandom();

      const desMesures = () => {
        const referentiel = creeReferentiel({
          mesures: {
            deconnexionAutomatique: {
              description: 'Mettre en place une déconnexion automatique',
              categorie: 'protection',
              indispensable: true,
            },
            revueDesDroits: {
              description: 'Revoir les droits des utilisateurs',
              categorie: 'gouvernance',
            },
          },
          categoriesMesures: {
            gouvernance: 'Gouvernance',
            protection: 'Protection',
          },
        });
        const mesuresPersonnalisees = {
          deconnexionAutomatique: {
            description: 'Mettre en place une déconnexion automatique',
            categorie: 'protection',
            indispensable: true,
          },
          revueDesDroits: {
            description: 'Revoir les droits des utilisateurs',
            categorie: 'gouvernance',
            indispensable: false,
          },
        };
        return new Mesures(
          {
            mesuresGenerales: [
              {
                id: 'deconnexionAutomatique',
                statut: 'enCours',
                echeance: '12/31/2026',
                modalites: 'Délai porté à 30 minutes',
              },
            ],
            mesuresSpecifiques: [
              {
                id: idMesureSpecifique,
                description: 'Revue trimestrielle des comptes à privilèges',
                categorie: 'gouvernance',
                statut: 'fait',
              },
            ],
          },
          referentiel,
          mesuresPersonnalisees
        );
      };

      it("renvoie les mesures du référentiel puis celles ajoutées par l'équipe", async () => {
        depotDonnees.service = async () =>
          unServiceV2().avecId(idService).avecMesures(desMesures()).construis();

        const reponse = await request(uneApp())
          .get(`/v1/services/${idService}/mesures`)
          .set('Authorization', enTeteAuthorization);

        expect(reponse.status).toBe(200);
        expect(reponse.body.donnees).toEqual([
          {
            id: 'deconnexionAutomatique',
            origine: 'referentielV2',
            intitule: 'Mettre en place une déconnexion automatique',
            categorie: 'protection',
            indispensable: true,
            statut: 'enCours',
            echeance: '2026-12-31',
            modalites: 'Délai porté à 30 minutes',
          },
          {
            id: 'revueDesDroits',
            origine: 'referentielV2',
            intitule: 'Revoir les droits des utilisateurs',
            categorie: 'gouvernance',
            indispensable: false,
            statut: null,
            echeance: null,
            modalites: null,
          },
          {
            id: idMesureSpecifique,
            origine: 'utilisateur',
            intitule: 'Revue trimestrielle des comptes à privilèges',
            categorie: 'gouvernance',
            indispensable: false,
            statut: 'fait',
            echeance: null,
            modalites: null,
          },
        ]);
      });

      it("indique qu'une mesure provient du référentiel V1 pour un service V1", async () => {
        depotDonnees.service = async () =>
          unService().avecId(idService).avecMesures(desMesures()).construis();

        const reponse = await request(uneApp())
          .get(`/v1/services/${idService}/mesures`)
          .set('Authorization', enTeteAuthorization);

        expect(
          reponse.body.donnees.map(
            ({ origine }: { origine: string }) => origine
          )
        ).toEqual(['referentielV1', 'referentielV1', 'utilisateur']);
      });

      it('renvoie une synthèse du nombre de mesures par statut', async () => {
        depotDonnees.service = async () =>
          unServiceV2().avecId(idService).avecMesures(desMesures()).construis();

        const reponse = await request(uneApp())
          .get(`/v1/services/${idService}/mesures`)
          .set('Authorization', enTeteAuthorization);

        expect(reponse.body.synthese).toEqual({
          fait: 1,
          enCours: 1,
          nonFait: 0,
          aLancer: 0,
          nonRenseigne: 1,
        });
      });

      it('renvoie une réponse conforme au schéma documenté', async () => {
        depotDonnees.service = async () =>
          unServiceV2().avecId(idService).avecMesures(desMesures()).construis();

        const reponse = await request(uneApp())
          .get(`/v1/services/${idService}/mesures`)
          .set('Authorization', enTeteAuthorization);

        expect(schemaReponseMesures.safeParse(reponse.body).success).toBe(true);
      });
    });

    describe('sur GET /v1/services/:id/homologation', () => {
      const unDossierFinalise = (
        dateHomologation: string,
        { archive = false } = {}
      ) => ({
        id: unUUIDRandom(),
        finalise: true,
        archive,
        decision: { dateHomologation, dureeValidite: 'unAn' },
      });

      const unDossierNonFinalise = () => ({
        id: unUUIDRandom(),
        decision: { dateHomologation: '2026-09-01', dureeValidite: 'unAn' },
      });

      const leServiceADesDossiers = (dossiers: object[]) => {
        depotDonnees.service = async () =>
          unServiceV2().avecId(idService).avecDossiers(dossiers).construis();
      };

      const recupereHomologation = () =>
        request(uneApp())
          .get(`/v1/services/${idService}/homologation`)
          .set('Authorization', enTeteAuthorization);

      beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-09-23T10:00:00Z'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it("renvoie l'homologation active du service", async () => {
        leServiceADesDossiers([
          unDossierFinalise('2025-02-03', { archive: true }),
          unDossierFinalise('2026-03-12'),
          unDossierNonFinalise(),
        ]);

        const reponse = await recupereHomologation();

        expect(reponse.status).toBe(200);
        expect(reponse.body).toEqual({
          enCours: {
            statut: 'activee',
            dateDecision: '2026-03-12',
            dureeValidite: 'unAn',
            dateEcheance: '2027-03-12',
          },
        });
      });

      it("renvoie le statut calculé à la date de l'appel", async () => {
        leServiceADesDossiers([unDossierFinalise('2025-02-03')]);

        const reponse = await recupereHomologation();

        expect(reponse.body.enCours.statut).toBe('expiree');
      });

      it("renvoie `null` quand le service n'a pas d'homologation active", async () => {
        leServiceADesDossiers([
          unDossierFinalise('2025-02-03', { archive: true }),
          unDossierNonFinalise(),
        ]);

        const reponse = await recupereHomologation();

        expect(reponse.body).toEqual({ enCours: null });
      });

      it('renvoie une réponse conforme au schéma documenté', async () => {
        leServiceADesDossiers([unDossierFinalise('2026-03-12')]);

        const reponse = await recupereHomologation();

        expect(schemaReponseHomologation.safeParse(reponse.body).success).toBe(
          true
        );
      });
    });

    describe('sur GET /v1/services/:id/risques', () => {
      const idRisqueSpecifique = unUUIDRandom();

      const recupereRisques = () =>
        request(uneApp())
          .get(`/v1/services/${idService}/risques`)
          .set('Authorization', enTeteAuthorization);

      describe("pour un service qui suit l'ancien référentiel de risques", () => {
        const referentiel = creeReferentiel({
          risques: {
            indisponibiliteService: {
              description: 'Indisponibilité du service',
              categories: ['disponibilite'],
            },
            fuiteDonnees: {
              description: 'Fuite de données',
              categories: ['confidentialite'],
            },
            risqueDesactive: {
              description: 'Risque désactivé',
              categories: ['integrite'],
            },
          },
          niveauxGravite: { grave: { position: 3 } },
          vraisemblancesRisques: { vraisemblable: { position: 2 } },
        });

        beforeEach(() => {
          const risques = new Risques(
            {
              risquesGeneraux: [
                {
                  id: 'indisponibiliteService',
                  niveauGravite: 'grave',
                  niveauVraisemblance: 'vraisemblable',
                  commentaire: 'Pas de bascule automatique',
                },
                { id: 'risqueDesactive', desactive: true },
              ],
              risquesSpecifiques: [
                {
                  id: idRisqueSpecifique,
                  intitule: 'Départ du seul administrateur système',
                  identifiantNumerique: 'RS1',
                  categories: [],
                  niveauGravite: 'grave',
                },
              ],
            },
            referentiel
          );
          depotDonnees.service = async () =>
            unService(referentiel)
              .avecId(idService)
              .avecRisques(risques)
              .construis();
        });

        it("renvoie tous les risques actifs du référentiel, puis ceux ajoutés par l'équipe", async () => {
          const reponse = await recupereRisques();

          expect(reponse.status).toBe(200);
          expect(reponse.body).toEqual({
            donnees: [
              {
                id: 'indisponibiliteService',
                origine: 'referentielV1',
                intitule: 'Indisponibilité du service',
                categories: ['disponibilite'],
                niveauGravite: 'grave',
                niveauVraisemblance: 'vraisemblable',
                commentaire: 'Pas de bascule automatique',
              },
              {
                id: 'fuiteDonnees',
                origine: 'referentielV1',
                intitule: 'Fuite de données',
                categories: ['confidentialite'],
                niveauGravite: null,
                niveauVraisemblance: null,
                commentaire: null,
              },
              {
                id: idRisqueSpecifique,
                origine: 'utilisateur',
                intitule: 'Départ du seul administrateur système',
                categories: [],
                niveauGravite: 'grave',
                niveauVraisemblance: null,
                commentaire: null,
              },
            ],
          });
        });

        it('renvoie une réponse conforme au schéma documenté', async () => {
          const reponse = await recupereRisques();

          expect(schemaReponseRisques.safeParse(reponse.body).success).toBe(
            true
          );
        });
      });

      describe('pour un service qui suit le nouveau référentiel de risques', () => {
        const unRisqueV2 = () =>
          new RisqueV2('V1', { OV2: 2 }, 3, [], {
            commentaire: 'Postes non chiffrés',
          });

        beforeEach(() => {
          const service = unServiceV2().avecId(idService).construis();
          service.risquesV2 = new RisquesV2({
            risques: [
              unRisqueV2(),
              new RisqueV2('V2', { OV1: 4 }, 4, [], { desactive: true }),
            ],
            risquesBruts: [],
            risquesCibles: [],
            risquesSpecifiques: [
              new RisqueSpecifiqueV2({
                id: idRisqueSpecifique,
                identifiantNumerique: 'RS1',
                intitule: 'Départ du seul administrateur système',
                categories: ['disponibilite'],
                risqueBrut: { gravite: 4, vraisemblance: 4 },
                gravite: 1,
                vraisemblance: 1,
              }),
            ],
          });
          depotDonnees.service = async () => service;
        });

        it('renvoie les risques V2 quand la fonctionnalité est activée', async () => {
          avecRisquesV2 = true;

          const reponse = await recupereRisques();

          expect(reponse.status).toBe(200);
          expect(reponse.body).toEqual({
            donnees: [
              {
                id: 'R1',
                origine: 'referentielV2',
                intitule: unRisqueV2().intitule,
                categories: ['confidentialite', 'integrite'],
                niveauGravite: 'significatif',
                niveauVraisemblance: 'tresVraisemblable',
                commentaire: 'Postes non chiffrés',
              },
              {
                id: idRisqueSpecifique,
                origine: 'utilisateur',
                intitule: 'Départ du seul administrateur système',
                categories: ['disponibilite'],
                niveauGravite: 'minime',
                niveauVraisemblance: 'peuVraisemblable',
                commentaire: null,
              },
            ],
          });
        });

        it("renvoie les risques V1 quand la fonctionnalité n'est pas activée", async () => {
          avecRisquesV2 = false;

          const reponse = await recupereRisques();

          const origines = reponse.body.donnees.map(
            ({ origine }: { origine: string }) => origine
          );
          expect(origines).not.toContain('referentielV2');
        });

        it('renvoie une réponse conforme au schéma documenté', async () => {
          avecRisquesV2 = true;

          const reponse = await recupereRisques();

          expect(schemaReponseRisques.safeParse(reponse.body).success).toBe(
            true
          );
        });
      });
    });
  });
});
