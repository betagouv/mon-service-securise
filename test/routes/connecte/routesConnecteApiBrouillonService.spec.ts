import { beforeEach } from 'vitest';
import testeurMSS from '../testeurMSS.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.js';
import { UUID } from '../../../src/typesBasiques.js';
import {
  BrouillonService,
  ProprietesBrouillonService,
} from '../../../src/modeles/brouillonService.js';
import {
  ErreurBrouillonInexistant,
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
} from '../../../src/erreurs.js';
import { unBrouillonComplet } from '../../constructeurs/constructeurBrouillonService.js';
import { uneChaineDeCaracteres } from '../../constructeurs/String.js';

describe('Le serveur MSS des routes /api/brouillon-service/*', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête POST sur `/api/brouillon-service`', () => {
    it('crée un brouillon de service et retourne son id', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: 'U1' });
      testeur.depotDonnees().nouveauBrouillonService = async () => unUUID('3');

      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: 'Le service',
      });

      expect(resultat.body.id).toBe(unUUID('3'));
    });

    it('retourne une erreur 400 si le nom de service est vide', async () => {
      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: ' ',
      });

      expect(resultat.status).toBe(400);
    });

    it('retourne une erreur 400 si le nom de service est trop long', async () => {
      const resultat = await testeur.post('/api/brouillon-service', {
        nomService: uneChaineDeCaracteres(201, 'a'),
      });

      expect(resultat.status).toBe(400);
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
    'quand requête PUT sur `/api/brouillon-service/:id/:$nomPropriete`',
    ({ nomPropriete, valeurCorrecte, valeurIncorrecte }) => {
      let idBrouillonTest: UUID;

      beforeEach(() => {
        idBrouillonTest = unUUIDRandom();
        testeur.middleware().reinitialise({ idUtilisateur: unUUID('1') });
        testeur.referentiel().recharge({ statutsDeploiement: { enCours: {} } });
        testeur.depotDonnees().lisBrouillonService = async () =>
          new BrouillonService(idBrouillonTest, { nomService: 'Un service' });
        testeur.depotDonnees().sauvegardeBrouillonService = async () => {};
      });

      it('lis le brouillon via le dépôt de données', async () => {
        let donneesRecues: { idUtilisateur: UUID; idBrouillon: UUID } | null =
          null;
        testeur.depotDonnees().lisBrouillonService = async (
          idUtilisateur: UUID,
          idBrouillon: UUID
        ) => {
          donneesRecues = { idUtilisateur, idBrouillon };
          return new BrouillonService(idBrouillonTest, {
            nomService: 'Un service',
          });
        };

        await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          { [nomPropriete]: valeurCorrecte }
        );

        expect(donneesRecues!.idUtilisateur).toBe(unUUID('1'));
        expect(donneesRecues!.idBrouillon).toBe(idBrouillonTest);
      });

      it(`mets à jour la propriete ${nomPropriete} via le dépôt de données`, async () => {
        let donneesRecues: {
          idUtilisateur: UUID;
          brouillon: BrouillonService;
        } | null = null;
        testeur.depotDonnees().sauvegardeBrouillonService = async (
          idUtilisateur: UUID,
          brouillon: BrouillonService
        ) => {
          donneesRecues = { idUtilisateur, brouillon };
        };

        await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          { [nomPropriete]: valeurCorrecte }
        );

        expect(donneesRecues!.idUtilisateur).toBe(unUUID('1'));
        expect(donneesRecues!.brouillon.id).toBe(idBrouillonTest);
        expect(
          donneesRecues!.brouillon.donneesAPersister()[
            nomPropriete as ProprietesBrouillonService
          ]
        ).toStrictEqual(valeurCorrecte);
      });

      it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
        const resultat = await testeur.put(
          `/api/brouillon-service/pas-un-uuid/${nomPropriete}`
        );

        expect(resultat.status).toBe(400);
      });

      it(`renvoie une erreur 400 si la propriété ${nomPropriete} passée n'est pas au bon format`, async () => {
        const resultat = await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          { [nomPropriete]: valeurIncorrecte }
        );

        expect(resultat.status).toBe(400);
      });

      it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
        testeur.depotDonnees().lisBrouillonService = async () => {
          throw new ErreurBrouillonInexistant();
        };

        const resultat = await testeur.put(
          `/api/brouillon-service/${idBrouillonTest}/${nomPropriete}`,
          { [nomPropriete]: valeurCorrecte }
        );

        expect(resultat.status).toBe(404);
      });
    }
  );

  describe('quand requête POST sur `/api/brouillon-service/:id/finalise`', () => {
    it('délègue la finalisation du brouillon au dépôt de données', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: unUUID('1') });
      const idBrouillonTest = unUUIDRandom();
      testeur.depotDonnees().finaliseBrouillonService = async (
        idUtilisateur: UUID,
        idBrouillon: UUID
      ) => {
        expect(idUtilisateur).toBe(unUUID('1'));
        expect(idBrouillon).toBe(idBrouillonTest);

        return unUUID('3');
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${idBrouillonTest}/finalise`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body.idService).toBe(unUUID('3'));
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const resultat = await testeur.post(
        '/api/brouillon-service/pas-un-uuid/finalise'
      );

      expect(resultat.status).toBe(400);
    });

    it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
      testeur.depotDonnees().finaliseBrouillonService = async () => {
        throw new ErreurBrouillonInexistant();
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${unUUIDRandom()}/finalise`
      );

      expect(reponse.status).toBe(404);
    });

    it('renvoie une erreur 422 si la création de service a échoué car le nom de service est déjà pris', async () => {
      testeur.depotDonnees().finaliseBrouillonService = async () => {
        throw new ErreurNomServiceDejaExistant();
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${unUUIDRandom()}/finalise`
      );

      expect(reponse.status).toBe(422);
      expect(reponse.body.erreur.code).toBe('NOM_SERVICE_DEJA_EXISTANT');
    });

    it('renvoie une erreur 422 si la création de service a échoué pour une autre raison', async () => {
      testeur.depotDonnees().finaliseBrouillonService = async () => {
        throw new ErreurDonneesObligatoiresManquantes();
      };

      const reponse = await testeur.post(
        `/api/brouillon-service/${unUUIDRandom()}/finalise`
      );

      expect(reponse.status).toBe(422);
    });
  });

  describe('quand requête GET sur `/api/brouillon-service/:id`', () => {
    it('retourne le brouillon', async () => {
      const idBrouillon = unUUIDRandom();

      testeur.depotDonnees().lisBrouillonService = async (
        _: UUID,
        idBrouillonDemande: UUID
      ) =>
        new BrouillonService(idBrouillonDemande, { nomService: 'Un service' });

      const reponse = await testeur.get(
        `/api/brouillon-service/${idBrouillon}`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        id: idBrouillon,
        nomService: 'Un service',
      });
    });

    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const reponse = await testeur.get('/api/brouillon-service/pas-un-uuid');

      expect(reponse.status).toBe(400);
    });

    it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
      testeur.depotDonnees().lisBrouillonService = async () => {
        throw new ErreurBrouillonInexistant();
      };

      const reponse = await testeur.get(
        `/api/brouillon-service/${unUUIDRandom()}`
      );

      expect(reponse.status).toBe(404);
    });
  });

  describe('quand requête GET sur `/api/brouillon-service/:id/niveauSecuriteRequis`', () => {
    it('retourne le niveau de securite requis', async () => {
      const idBrouillon = unUUIDRandom();

      testeur.depotDonnees().lisBrouillonService = async () =>
        unBrouillonComplet().construis();

      const reponse = await testeur.get(
        `/api/brouillon-service/${idBrouillon}/niveauSecuriteRequis`
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({
        niveauDeSecuriteMinimal: 'niveau3',
      });
    });

    it("renvoie une erreur 404 si le brouillon n'existe pas", async () => {
      testeur.depotDonnees().lisBrouillonService = async () => {
        throw new ErreurBrouillonInexistant();
      };

      const reponse = await testeur.get(
        `/api/brouillon-service/${unUUIDRandom()}/niveauSecuriteRequis`
      );

      expect(reponse.status).toBe(404);
    });
  });

  describe('quand requête DELETE sur `/api/brouillon-service/:id`', () => {
    it("renvoie une erreur 400 si l'ID passé n'est pas un UUID", async () => {
      const reponse = await testeur.delete(
        '/api/brouillon-service/pas-un-uuid'
      );

      expect(reponse.status).toBe(400);
    });

    it('délègue au dépôt de données la suppression du brouillon', async () => {
      let depotAppele = false;
      testeur.depotDonnees().supprimeBrouillonService = async () => {
        depotAppele = true;
      };

      const { status } = await testeur.delete(
        `/api/brouillon-service/${unUUIDRandom()}`
      );

      expect(status).toBe(200);
      expect(depotAppele).toBe(true);
    });
  });
});
