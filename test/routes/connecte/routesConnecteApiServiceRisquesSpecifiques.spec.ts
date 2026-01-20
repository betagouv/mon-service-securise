import { unService } from '../../constructeurs/constructeurService.js';
import Risques from '../../../src/modeles/risques.js';
import { ErreurRisqueInconnu } from '../../../src/erreurs.js';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { UUID } from '../../../src/typesBasiques.js';
import RisqueSpecifique from '../../../src/modeles/risqueSpecifique.js';
import { unUUIDRandom } from '../../constructeurs/UUID.js';

const { ECRITURE } = Permissions;
const { RISQUES } = Rubriques;

describe('Les routes API des risques spécifiques de services', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
    niveauGravite: 'significatif',
    niveauVraisemblance: 'peuVraisemblable',
    commentaire: '',
    description: '',
    intitule: 'risque',
    categories: ['integrite'],
    ...cleValeur,
  });

  describe('quand requête POST sur `/api/service/:id/risquesSpecifiques', () => {
    beforeEach(() => {
      testeur.depotDonnees().ajouteRisqueSpecifiqueAService = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/risquesSpecifiques',
          }
        );
    });

    describe('jette une erreur 400...', () => {
      it.each([
        { niveauGravite: undefined },
        { niveauVraisemblance: undefined },
        { commentaire: 123 },
        { description: 123 },
        { intitule: undefined },
        { categories: [] },
      ])('si la payload contient %s', async (donneesDuTest) => {
        const { status } = await testeur.post(
          '/api/service/456/risquesSpecifiques',
          unePayloadValideSauf(donneesDuTest)
        );
        expect(status).toBe(400);
      });
    });

    it("délègue au dépôt de donnée l'ajout du risque", async () => {
      let idServiceRecu;
      let donneesRecues;
      testeur.depotDonnees().ajouteRisqueSpecifiqueAService = async (
        idService: UUID,
        donnees: RisqueSpecifique
      ) => {
        idServiceRecu = idService;
        donneesRecues = donnees;
        // eslint-disable-next-line no-param-reassign
        donnees.id = 'RS1';
      };

      await testeur.post(
        '/api/service/456/risquesSpecifiques',
        unePayloadValideSauf()
      );

      expect(idServiceRecu).toBe('456');
      expect(donneesRecues!.intitule).to.eql('risque');
      expect(donneesRecues!.niveauGravite).to.eql('significatif');
      expect(donneesRecues!.niveauVraisemblance).to.eql('peuVraisemblable');
      expect(donneesRecues!.commentaire).to.eql('');
    });

    it('retourne la représentation du risque ajouté', async () => {
      testeur.depotDonnees().ajouteRisqueSpecifiqueAService = async (
        _: UUID,
        risque: RisqueSpecifique
      ) => {
        // eslint-disable-next-line no-param-reassign
        risque.id = 'abcd';
        // eslint-disable-next-line no-param-reassign
        risque.identifiantNumerique = 'RS1';
      };

      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        unePayloadValideSauf()
      );

      expect(reponse.body.id).toBe('abcd');
      expect(reponse.body.identifiantNumerique).toBe('RS1');
    });
  });

  describe('quand requête PUT sur `/api/service/:id/risquesSpecifiques', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        niveauxGravite: { unNiveau: {} },
        categoriesRisques: { C1: {} },
        vraisemblancesRisques: { unNiveauVraisemblance: {} },
      });
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService =
        async () => {};
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecRisques(
          new Risques({
            risquesSpecifiques: [
              { id: 'RS1', categories: ['C1'], intitule: 'intitule1' },
            ],
          })
        )
        .construis();

      testeur
        .middleware()
        .reinitialise({ idUtilisateur: '999', serviceARenvoyer });
    });

    it("jette une erreur 400 si l'ID risque est invalide", async () => {
      const { status } = await testeur.put(
        '/api/service/456/risquesSpecifiques/pasUnUUID',
        {
          niveauGravite: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(status).toBe(400);
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          { method: 'put', url: '/api/service/456/risquesSpecifiques/RS1' }
        );
    });

    describe('jette une erreur 400...', () => {
      it.each([
        { niveauGravite: undefined },
        { niveauVraisemblance: undefined },
        { commentaire: 123 },
        { description: 123 },
        { intitule: undefined },
        { categories: [] },
      ])('si la payload contient %s', async (donneesDuTest) => {
        const { status } = await testeur.put(
          `/api/service/456/risquesSpecifiques/${unUUIDRandom()}`,
          unePayloadValideSauf(donneesDuTest)
        );
        expect(status).toBe(400);
      });
    });

    it('renvoi une erreur 404 si le risque est introuvable', async () => {
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService = async () => {
        throw new ErreurRisqueInconnu();
      };

      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        'Le risque est introuvable',
        {
          method: 'put',
          url: `/api/service/456/risquesSpecifiques/${unUUIDRandom()}`,
          data: unePayloadValideSauf(),
        }
      );
    });

    it('délègue au dépôt de donnée la mise à jour du risque', async () => {
      let idServiceRecu;
      let donneesRecues;
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService = async (
        idService: UUID,
        donnees: RisqueSpecifique
      ) => {
        idServiceRecu = idService;
        donneesRecues = donnees;
      };

      const idRisque = unUUIDRandom();
      await testeur.put(
        `/api/service/456/risquesSpecifiques/${idRisque}`,
        unePayloadValideSauf()
      );

      expect(idServiceRecu).toBe('456');
      expect(donneesRecues!.id).to.eql(idRisque);
      expect(donneesRecues!.intitule).to.eql('risque');
      expect(donneesRecues!.niveauGravite).to.eql('significatif');
      expect(donneesRecues!.niveauVraisemblance).to.eql('peuVraisemblable');
      expect(donneesRecues!.commentaire).to.eql('');
    });

    it('retourne la représentation du risque modifié', async () => {
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService =
        async () => {};

      const reponse = await testeur.put(
        `/api/service/456/risquesSpecifiques/${unUUIDRandom()}`,
        unePayloadValideSauf()
      );

      expect(reponse.body.intitule).toBe('risque');
    });
  });

  describe('quand requête DELETE sur `/api/service/:id/risquesSpecifiques/:idRisque', () => {
    beforeEach(() => {
      testeur.depotDonnees().supprimeRisqueSpecifiqueDuService = async () => {};
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          {
            method: 'delete',
            url: `/api/service/456/risquesSpecifiques/${unUUIDRandom()}`,
          }
        );
    });

    it("jette une erreur 400 si l'ID est invalide", async () => {
      const { status } = await testeur.delete(
        '/api/service/456/risquesSpecifiques/pasUnUUID'
      );

      expect(status).toBe(400);
    });

    it('délègue au dépôt de donnée la suppression du risque', async () => {
      let idServiceRecu;
      let idRisqueRecu;
      testeur.depotDonnees().supprimeRisqueSpecifiqueDuService = async (
        idService: UUID,
        idRisque: UUID
      ) => {
        idServiceRecu = idService;
        idRisqueRecu = idRisque;
      };

      const idRisque = unUUIDRandom();
      await testeur.delete(`/api/service/456/risquesSpecifiques/${idRisque}`);

      expect(idServiceRecu).toBe('456');
      expect(idRisqueRecu).toBe(idRisque);
    });
  });
});
