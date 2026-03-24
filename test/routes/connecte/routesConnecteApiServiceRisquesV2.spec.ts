import testeurMSS from '../testeurMSS.js';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import {
  DonneesRisqueV2,
  IdRisqueV2,
} from '../../../src/moteurRisques/v2/risquesV2.types.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { DonneesMiseAJourRisqueSpecifiqueV2 } from '../../../src/moteurRisques/v2/risqueSpecifiqueV2.ts';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';

const { ECRITURE, LECTURE } = Permissions;
const { RISQUES } = Rubriques;

describe('Les routes /service/:id/risques/v2', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête GET sur `/api/service/:id/risques/v2', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'get',
            url: '/api/service/456/risques/v2',
          }
        );
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(
          testeur.app(),
          '/api/service/456/risques/v2'
        );
    });

    it('retourne la représentation des risques V2', async () => {
      testeur
        .middleware()
        // @ts-expect-error le middleware est rechargé partiellement
        .reinitialise({ serviceARenvoyer: unServiceV2().construis() });

      const reponse = await testeur.get('/api/service/456/risques/v2');

      expect(reponse.body.risques).toBeInstanceOf(Array);
      expect(reponse.body.risquesCibles).toBeInstanceOf(Array);
      expect(reponse.body.risquesBruts).toBeInstanceOf(Array);
    });
  });

  describe('quand requête PUT sur `/api/service/:id/risques/v2/:idRisque', () => {
    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/risques/v2/R3',
          }
        );
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), {
          method: 'put',
          url: '/api/service/456/risques/v2/R3',
        });
    });

    it("jette une erreur si l'identifiant du risque est invalide", async () => {
      const { status } = await testeur.put(
        '/api/service/456/risques/v2/pasUnRisque',
        {
          desactive: true,
        }
      );

      expect(status).toBe(400);
    });

    it('jette une erreur si `desactive` est invalide', async () => {
      const { status } = await testeur.put('/api/service/456/risques/v2/R3', {
        desactive: 'invalide',
      });

      expect(status).toBe(400);
    });

    it('jette une erreur si `commentaire` est invalide', async () => {
      const { status } = await testeur.put('/api/service/456/risques/v2/R3', {
        commentaire: 1234,
      });

      expect(status).toBe(400);
    });

    it('mets à jour les données du risque dans le service', async () => {
      let idServiceRecu;
      let idRisqueRecues;
      let donneesRisqueRecues;
      testeur.depotDonnees().metsAJourRisqueV2 = (
        idService: UUID,
        idRisque: IdRisqueV2,
        donneesRisque: DonneesRisqueV2
      ) => {
        idServiceRecu = idService;
        donneesRisqueRecues = donneesRisque;
        idRisqueRecues = idRisque;
      };

      const { status } = await testeur.put('/api/service/456/risques/v2/R3', {
        desactive: true,
        commentaire: 'un commentaire',
      });

      expect(status).toBe(204);
      expect(idServiceRecu).toBe('456');
      expect(idRisqueRecues).toBe('R3');
      expect(donneesRisqueRecues!.desactive).toBe(true);
      expect(donneesRisqueRecues!.commentaire).toBe('un commentaire');
    });
  });

  describe('quand requête POST sur `/api/service/:id/risques/v2/specifiques', () => {
    const donneesRisquesSpecifiquesValides = {
      intitule: 'Initulé du risque',
      description: 'une description',
      categories: ['disponibilite'],
      vraisemblance: 1,
      vraisemblanceBrute: 2,
      gravite: 3,
      graviteBrute: 4,
      commentaire: 'un commentaire',
    };

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/risques/v2/specifiques',
          }
        );
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), {
          method: 'post',
          url: '/api/service/456/risques/v2/specifiques',
        });
    });

    it.each([
      { cle: 'intitule', valeur: '' },
      { cle: 'description', valeur: 1234 },
      { cle: 'categories', valeur: ['pasUneCategorie'] },
      { cle: 'categories', valeur: [] },
      { cle: 'vraisemblance', valeur: 6 },
      { cle: 'vraisemblanceBrute', valeur: 8 },
      { cle: 'gravite', valeur: 10 },
      { cle: 'graviteBrute', valeur: 12 },
      { cle: 'commentaire', valeur: 1234 },
    ])(
      'jette une erreur si la propriété $cle est invalide',
      async ({ cle, valeur }) => {
        const { status } = await testeur.post(
          '/api/service/456/risques/v2/specifiques',
          {
            ...donneesRisquesSpecifiquesValides,
            [cle]: valeur,
          }
        );

        expect(status).toBe(400);
      }
    );

    it("délègue au dépôt de données l'ajout du risque spécifique", async () => {
      let idServiceRecu;
      let donneesRisqueRecues;
      testeur.depotDonnees().ajouteRisqueSpecifiqueV2 = (
        idService: UUID,
        donneesRisque: DonneesMiseAJourRisqueSpecifiqueV2
      ) => {
        idServiceRecu = idService;
        donneesRisqueRecues = donneesRisque;
      };

      const { status } = await testeur.post(
        '/api/service/456/risques/v2/specifiques',
        donneesRisquesSpecifiquesValides
      );

      expect(status).toBe(201);
      expect(idServiceRecu).toBe('456');
      expect(donneesRisqueRecues).toEqual({
        intitule: 'Initulé du risque',
        description: 'une description',
        categories: ['disponibilite'],
        risqueBrut: {
          vraisemblance: 2,
          gravite: 4,
        },
        vraisemblance: 1,
        gravite: 3,
        commentaire: 'un commentaire',
      });
    });
  });

  describe('quand requête PUT sur `/api/service/:id/risques/v2/specifiques/:idRisque', () => {
    const donneesRisquesSpecifiquesValides = {
      intitule: 'Initulé du risque',
      description: 'une description',
      categories: ['disponibilite'],
      vraisemblance: 1,
      vraisemblanceBrute: 2,
      gravite: 3,
      graviteBrute: 4,
      commentaire: 'un commentaire',
    };

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'put',
            url: `/api/service/456/risques/v2/specifiques/${unUUID('1')}`,
          }
        );
    });

    it("utilise le middleware de chargement de l'autorisation", async () => {
      await testeur
        .middleware()
        .verifieChargementDesAutorisations(testeur.app(), {
          method: 'put',
          url: `/api/service/456/risques/v2/specifiques/${unUUID('1')}`,
        });
    });

    it.each([
      { cle: 'intitule', valeur: '' },
      { cle: 'description', valeur: 1234 },
      { cle: 'categories', valeur: ['pasUneCategorie'] },
      { cle: 'categories', valeur: [] },
      { cle: 'vraisemblance', valeur: 6 },
      { cle: 'vraisemblanceBrute', valeur: 8 },
      { cle: 'gravite', valeur: 10 },
      { cle: 'graviteBrute', valeur: 12 },
      { cle: 'commentaire', valeur: 1234 },
    ])(
      'jette une erreur si la propriété $cle est invalide',
      async ({ cle, valeur }) => {
        const { status } = await testeur.put(
          `/api/service/456/risques/v2/specifiques/${unUUID('1')}`,
          {
            ...donneesRisquesSpecifiquesValides,
            [cle]: valeur,
          }
        );

        expect(status).toBe(400);
      }
    );

    it("jette une erreur si l'id de risque est invalide", async () => {
      const { status } = await testeur.put(
        `/api/service/456/risques/v2/specifiques/pasUnUUID`,
        donneesRisquesSpecifiquesValides
      );

      expect(status).toBe(400);
    });

    it('délègue au dépôt de données la modification du risque spécifique', async () => {
      let idServiceRecu;
      let idRisqueRecu;
      let donneesRisqueRecues;
      testeur.depotDonnees().metsAJourRisqueSpecifiqueV2 = (
        idService: UUID,
        idRisque: UUID,
        donneesRisque: DonneesMiseAJourRisqueSpecifiqueV2
      ) => {
        idServiceRecu = idService;
        idRisqueRecu = idRisque;
        donneesRisqueRecues = donneesRisque;
      };

      const idRisque = unUUIDRandom();
      const { status } = await testeur.put(
        `/api/service/456/risques/v2/specifiques/${idRisque}`,
        donneesRisquesSpecifiquesValides
      );

      expect(status).toBe(200);
      expect(idServiceRecu).toBe('456');
      expect(idRisqueRecu).toBe(idRisque);
      expect(donneesRisqueRecues).toEqual({
        intitule: 'Initulé du risque',
        description: 'une description',
        categories: ['disponibilite'],
        risqueBrut: {
          vraisemblance: 2,
          gravite: 4,
        },
        vraisemblance: 1,
        gravite: 3,
        commentaire: 'un commentaire',
      });
    });
  });
});
