import { beforeEach } from 'vitest';
import testeurMSS from '../testeurMSS.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.js';
import {
  BrouillonService,
  ProprietesBrouillonService,
} from '../../../src/modeles/brouillonService.js';
import { ErreurSimulationInexistante } from '../../../src/erreurs.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.js';
import { UUID } from '../../../src/typesBasiques.js';
import { unBrouillonComplet } from '../../constructeurs/constructeurBrouillonService.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';
import { DonneesMesureGenerale } from '../../../src/modeles/mesureGenerale.type.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import { SimulationMigrationReferentiel } from '../../../src/moteurRegles/simulationMigration/simulationMigrationReferentiel.ts';
import Service from '../../../src/modeles/service.js';

const { LECTURE, ECRITURE } = Permissions;
const { DECRIRE, SECURISER } = Rubriques;

describe('Le serveur MSS des routes /api/service/:id/simulation-migration-referentiel/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  describe('quand requête GET sur `/api/service/:id/simulation-migration-referentiel`', () => {
    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService(
        [
          { niveau: LECTURE, rubrique: DECRIRE },
          { niveau: LECTURE, rubrique: SECURISER },
        ],
        testeur.app(),
        {
          method: 'get',
          url: `/api/service/${unUUIDRandom()}/simulation-migration-referentiel`,
        }
      );
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const reponse = await testeur.get(
        '/api/service/PAS_UN_UUID/simulation-migration-referentiel'
      );

      expect(reponse.status).toBe(400);
    });

    it('retourne la simulation pour le service correspondant', async () => {
      const idService = unUUIDRandom();

      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
        new BrouillonService(idService, { nomService: 'Une simulation' });

      const reponse = await testeur.get(
        `/api/service/${idService}/simulation-migration-referentiel`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        id: idService,
        nomService: 'Une simulation',
      });
    });

    it("renvoie une erreur 404 si la simulation n'existe pas", async () => {
      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () => {
        throw new ErreurSimulationInexistante();
      };

      const reponse = await testeur.get(
        `/api/service/${unUUIDRandom()}/simulation-migration-referentiel`
      );

      expect(reponse.status).toBe(404);
    });
  });

  describe.each([
    {
      nomPropriete: 'siret',
      valeurCorrecte: '12312312312312',
      valeurIncorrecte: '123',
    },
    {
      nomPropriete: 'nomService',
      valeurCorrecte: 'Un service',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'nomService',
      valeurCorrecte: 'Un service',
      valeurIncorrecte: uneChaineDeCaracteres(201, 'a'),
    },
    {
      nomPropriete: 'statutDeploiement',
      valeurCorrecte: 'enCours',
      valeurIncorrecte: 'unMauvaisStatut',
    },
    {
      nomPropriete: 'presentation',
      valeurCorrecte: 'Mon service qui …',
      valeurIncorrecte: 10,
    },
    {
      nomPropriete: 'presentation',
      valeurCorrecte: undefined,
      valeurIncorrecte: uneChaineDeCaracteres(2001, 'a'),
    },
    {
      nomPropriete: 'pointsAcces',
      valeurCorrecte: ['https://monservicesecurise.fr', 'www.sansHttps.fr'],
      valeurIncorrecte: [''], // On accepte les chaînes au sens large, pour ne pas gêner les utilisateurs. Mais vide est interdit.
    },
    {
      nomPropriete: 'pointsAcces',
      valeurCorrecte: ['https://monservicesecurise.fr'],
      valeurIncorrecte: [uneChaineDeCaracteres(201, 'a')],
    },
    {
      nomPropriete: 'typeService',
      valeurCorrecte: ['api', 'serviceEnLigne'],
      valeurIncorrecte: ['uneValeurImaginaire'],
    },
    {
      nomPropriete: 'typeService',
      valeurCorrecte: ['api'],
      valeurIncorrecte: [],
    },
    {
      nomPropriete: 'specificitesProjet',
      valeurCorrecte: ['postesDeTravail'],
      valeurIncorrecte: ['uneValeurImaginaire'],
    },
    {
      nomPropriete: 'specificitesProjet',
      valeurCorrecte: [],
      valeurIncorrecte: 'uneValeurImaginaire',
    },
    {
      nomPropriete: 'typeHebergement',
      valeurCorrecte: 'cloud',
      valeurIncorrecte: 'unMauvaisType',
    },
    {
      nomPropriete: 'typeHebergement',
      valeurCorrecte: 'cloud',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'activitesExternalisees',
      valeurCorrecte: ['developpementLogiciel'],
      valeurIncorrecte: 'uneCleSeule',
    },
    {
      nomPropriete: 'activitesExternalisees',
      valeurCorrecte: [],
      valeurIncorrecte: ['uneCleInexistante'],
    },
    {
      nomPropriete: 'ouvertureSysteme',
      valeurCorrecte: 'interne',
      valeurIncorrecte: 'uneCleInexistante',
    },
    {
      nomPropriete: 'ouvertureSysteme',
      valeurCorrecte: 'accessibleSurInternet',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'audienceCible',
      valeurCorrecte: 'large',
      valeurIncorrecte: 'uneInconnue',
    },
    {
      nomPropriete: 'audienceCible',
      valeurCorrecte: 'large',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'dureeDysfonctionnementAcceptable',
      valeurCorrecte: 'moinsDe12h',
      valeurIncorrecte: 'dureeInconnue',
    },
    {
      nomPropriete: 'dureeDysfonctionnementAcceptable',
      valeurCorrecte: 'moinsDe12h',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'categoriesDonneesTraitees',
      valeurCorrecte: ['documentsRHSensibles'],
      valeurIncorrecte: ['mauvaiseCategorie'],
    },
    {
      nomPropriete: 'categoriesDonneesTraitees',
      valeurCorrecte: [],
      valeurIncorrecte: 'uneChaine',
    },
    {
      nomPropriete: 'categoriesDonneesTraiteesSupplementaires',
      valeurCorrecte: ['uneChaine'],
      valeurIncorrecte: 'uneChaine',
    },
    {
      nomPropriete: 'categoriesDonneesTraiteesSupplementaires',
      valeurCorrecte: ['uneChaine'],
      valeurIncorrecte: [uneChaineDeCaracteres(201, 'a')],
    },
    {
      nomPropriete: 'categoriesDonneesTraiteesSupplementaires',
      valeurCorrecte: [],
      valeurIncorrecte: [' '],
    },
    {
      nomPropriete: 'volumetrieDonneesTraitees',
      valeurCorrecte: 'eleve',
      valeurIncorrecte: 'uneChaine',
    },
    {
      nomPropriete: 'volumetrieDonneesTraitees',
      valeurCorrecte: 'faible',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'localisationDonneesTraitees',
      valeurCorrecte: 'UE',
      valeurIncorrecte: 'uneChaine',
    },
    {
      nomPropriete: 'localisationDonneesTraitees',
      valeurCorrecte: 'UE',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'niveauSecurite',
      valeurCorrecte: 'niveau1',
      valeurIncorrecte: '',
    },
    {
      nomPropriete: 'niveauSecurite',
      valeurCorrecte: 'niveau3',
      valeurIncorrecte: 'unNiveauInconnu',
    },
  ])(
    'quand requête PUT sur `/api/service/:id/simulation-migration-referentiel/:$nomPropriete`',
    ({ nomPropriete, valeurCorrecte, valeurIncorrecte }) => {
      let idService: UUID;

      beforeEach(() => {
        idService = unUUIDRandom();
        testeur.middleware().reinitialise({ idUtilisateur: unUUID('1') });
        testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
          new BrouillonService(idService, { nomService: 'Un service' });
        testeur.depotDonnees().sauvegardeSimulationMigrationReferentiel =
          async () => {};
      });

      it('recherche le service correspondant', async () => {
        await testeur.middleware().verifieRechercheService(
          [
            { niveau: ECRITURE, rubrique: DECRIRE },
            { niveau: ECRITURE, rubrique: SECURISER },
          ],
          testeur.app(),
          {
            method: 'put',
            url: `/api/service/${idService}/simulation-migration-referentiel/${nomPropriete}`,
          }
        );
      });

      it('lis la simulation via le dépôt de données', async () => {
        let idRecu: UUID;
        testeur.depotDonnees().lisSimulationMigrationReferentiel = async (
          id: UUID
        ) => {
          idRecu = id;
          return new BrouillonService(idService, {
            nomService: 'Un service',
          });
        };

        await testeur.put(
          `/api/service/${idService}/simulation-migration-referentiel/${nomPropriete}`,
          { [nomPropriete]: valeurCorrecte }
        );

        expect(idRecu!).toBe(idService);
      });

      it(`mets à jour la propriete ${nomPropriete} via le dépôt de données`, async () => {
        let donneesRecues: {
          id: UUID;
          simulation: BrouillonService;
        };
        testeur.depotDonnees().sauvegardeSimulationMigrationReferentiel =
          async (id: UUID, simulation: BrouillonService) => {
            donneesRecues = { id, simulation };
          };

        await testeur.put(
          `/api/service/${idService}/simulation-migration-referentiel/${nomPropriete}`,
          { [nomPropriete]: valeurCorrecte }
        );

        expect(donneesRecues!.id).toBe(idService);
        expect(
          donneesRecues!.simulation.donneesAPersister()[
            nomPropriete as ProprietesBrouillonService
          ]
        ).toStrictEqual(valeurCorrecte);
      });

      it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
        const resultat = await testeur.put(
          `/api/service/pas-un-uuid/simulation-migration-referentiel/${nomPropriete}`
        );

        expect(resultat.status).toBe(400);
      });

      it(`renvoie une erreur 400 si la propriété ${nomPropriete} passée n'est pas au bon format`, async () => {
        const resultat = await testeur.put(
          `/api/service/${idService}/simulation-migration-referentiel/${nomPropriete}`,
          { [nomPropriete]: valeurIncorrecte }
        );

        expect(resultat.status).toBe(400);
      });

      it("renvoie une erreur 404 si la simulation n'existe pas", async () => {
        testeur.depotDonnees().lisSimulationMigrationReferentiel = async () => {
          throw new ErreurSimulationInexistante();
        };

        const resultat = await testeur.put(
          `/api/service/${idService}/simulation-migration-referentiel/${nomPropriete}`,
          { [nomPropriete]: valeurCorrecte }
        );

        expect(resultat.status).toBe(404);
      });
    }
  );

  describe('quand requête GET sur `/api/service/:id/simulation-migration-referentiel/niveauSecuriteRequis`', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: DECRIRE }],
          testeur.app(),
          {
            method: 'get',
            url: `/api/service/${unUUIDRandom()}/simulation-migration-referentiel/niveauSecuriteRequis`,
          }
        );
    });

    it('retourne le niveau de securite requis', async () => {
      const idService = unUUIDRandom();

      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
        unBrouillonComplet().construis();

      const reponse = await testeur.get(
        `/api/service/${idService}/simulation-migration-referentiel/niveauSecuriteRequis`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        niveauDeSecuriteMinimal: 'niveau3',
      });
    });

    it("renvoie une erreur 404 si la simulation n'existe pas", async () => {
      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () => {
        throw new ErreurSimulationInexistante();
      };

      const reponse = await testeur.get(
        `/api/service/${unUUIDRandom()}/simulation-migration-referentiel/niveauSecuriteRequis`
      );

      expect(reponse.status).toBe(404);
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const resultat = await testeur.get(
        `/api/service/pas-un-uuid/simulation-migration-referentiel/niveauSecuriteRequis`
      );

      expect(resultat.status).toBe(400);
    });
  });

  describe('quand requête GET sur `/api/service/:id/simulation-migration-referentiel/evolution-mesures`', () => {
    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService(
        [
          { niveau: LECTURE, rubrique: DECRIRE },
          { niveau: LECTURE, rubrique: SECURISER },
        ],
        testeur.app(),
        {
          method: 'get',
          url: `/api/service/${unUUIDRandom()}/simulation-migration-referentiel/evolution-mesures`,
        }
      );
    });

    describe('concernant les données retournées', () => {
      it("retourne l'évolution de l'indice cyber du service", async () => {
        const idService = unUUIDRandom();
        const serviceV1 = unService().avecId(idService).construis();
        serviceV1.mesures.indiceCyber = () => ({ total: 2.5 });
        testeur.referentiel().recharge({ indiceCyber: { noteMax: 5 } });
        // @ts-expect-error on ne veut réinitialiser que le service
        testeur.middleware().reinitialise({ serviceARenvoyer: serviceV1 });
        testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
          unBrouillonComplet().construis();

        const reponse = await testeur.get(
          `/api/service/${idService}/simulation-migration-referentiel/evolution-mesures`
        );

        expect(reponse.status).toBe(200);
        expect(reponse.body.evolutionIndiceCyber.v1).toBe(2.5);
        expect(reponse.body.evolutionIndiceCyber.max).toBe(5);
        expect(reponse.body.evolutionIndiceCyber.v2).not.toBe(undefined);
      });

      it('retourne les évolutions de mesures', async () => {
        const idService = unUUIDRandom();
        const serviceV1 = unService().avecId(idService).construis();
        // @ts-expect-error on ne veut réinitialiser que le service
        testeur.middleware().reinitialise({ serviceARenvoyer: serviceV1 });
        testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
          unBrouillonComplet().construis();

        const reponse = await testeur.get(
          `/api/service/${idService}/simulation-migration-referentiel/evolution-mesures`
        );

        expect(reponse.status).toBe(200);
        expect(reponse.body.evolutionMesures.nbMesures).not.toBe(undefined);
      });
    });

    it("renvoie une erreur 404 si la simulation n'existe pas", async () => {
      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () => {
        throw new ErreurSimulationInexistante();
      };

      const reponse = await testeur.get(
        `/api/service/${unUUIDRandom()}/simulation-migration-referentiel/evolution-mesures`
      );

      expect(reponse.status).toBe(404);
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const resultat = await testeur.get(
        `/api/service/pas-un-uuid/simulation-migration-referentiel/evolution-mesures`
      );

      expect(resultat.status).toBe(400);
    });
  });

  describe('quand requête POST sur `/api/service/:id/simulation-migration-referentiel/finalise`', () => {
    const idService = unUUIDRandom();
    let serviceV1: Service;

    beforeEach(() => {
      testeur.depotDonnees().migreServiceVersV2 = async () => {};
      testeur.depotDonnees().migreActivitesMesuresVersV2 = async () => {};
      testeur.depotDonnees().supprimeSimulationMigrationReferentiel =
        async () => {};
      serviceV1 = unService().avecId(idService).construis();
      testeur.middleware().reinitialise({
        serviceARenvoyer: serviceV1,
        idUtilisateur: unUUID('1'),
      });
      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () =>
        unBrouillonComplet().construis();
    });

    it('recherche le service correspondant', async () => {
      await testeur.middleware().verifieRechercheService(
        [
          { niveau: ECRITURE, rubrique: DECRIRE },
          { niveau: ECRITURE, rubrique: SECURISER },
        ],
        testeur.app(),
        {
          method: 'post',
          url: `/api/service/${unUUIDRandom()}/simulation-migration-referentiel/finalise`,
        }
      );
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const resultat = await testeur.post(
        `/api/service/pas-un-uuid/simulation-migration-referentiel/finalise`
      );

      expect(resultat.status).toBe(400);
    });

    it("renvoie une erreur 404 si la simulation n'existe pas", async () => {
      testeur.depotDonnees().lisSimulationMigrationReferentiel = async () => {
        throw new ErreurSimulationInexistante();
      };

      const reponse = await testeur.post(
        `/api/service/${unUUIDRandom()}/simulation-migration-referentiel/finalise`
      );

      expect(reponse.status).toBe(404);
    });

    it('délègue au dépôt de données la migration du service en V2', async () => {
      let donneesRecues;
      testeur.depotDonnees().migreServiceVersV2 = async (
        idUtilisateur: UUID,
        idServiceRecu: UUID,
        descriptionServiceV2: DescriptionServiceV2,
        donneesMesuresV2: DonneesMesureGenerale<IdMesureV2>[]
      ) => {
        donneesRecues = {
          idUtilisateur,
          idService: idServiceRecu,
          descriptionServiceV2,
          donneesMesuresV2,
        };
      };

      const reponse = await testeur.post(
        `/api/service/${idService}/simulation-migration-referentiel/finalise`
      );

      expect(reponse.status).toBe(201);
      expect(donneesRecues!.idUtilisateur).toBe(unUUID('1'));
      expect(donneesRecues!.idService).toBe(idService);
      expect(donneesRecues!.descriptionServiceV2.nomService).toBe('Service A');
      expect(donneesRecues!.donneesMesuresV2).not.toBe(undefined);
    });

    it('délègue au dépôt de données la migration des activités de mesure du service en V2', async () => {
      let donneesRecues;
      testeur.depotDonnees().migreServiceVersV2 = async () => {};
      testeur.depotDonnees().migreActivitesMesuresVersV2 = async (
        simulation: SimulationMigrationReferentiel
      ) => {
        donneesRecues = {
          simulation,
        };
      };

      await testeur.post(
        `/api/service/${idService}/simulation-migration-referentiel/finalise`
      );

      expect(donneesRecues!.simulation.idService()).toBe(idService);
    });

    it('supprime la simulation après avoir migré le service', async () => {
      let idRecu;
      testeur.depotDonnees().supprimeSimulationMigrationReferentiel = async (
        idServiceConcerne: UUID
      ) => {
        idRecu = idServiceConcerne;
      };

      await testeur.post(
        `/api/service/${idService}/simulation-migration-referentiel/finalise`
      );

      expect(idRecu).toBe(idService);
    });
  });
});
