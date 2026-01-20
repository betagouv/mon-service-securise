import { unService } from '../../constructeurs/constructeurService.js';
import Risques from '../../../src/modeles/risques.js';
import { ErreurRisqueInconnu } from '../../../src/erreurs.ts';
import testeurMSS from '../testeurMSS.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import RisqueSpecifique from '../../../src/modeles/risqueSpecifique.js';

const { ECRITURE } = Permissions;
const { RISQUES } = Rubriques;

describe('Les routes API des risques spécifiques de services', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête POST sur `/api/service/:id/risquesSpecifiques', () => {
    beforeEach(() => {
      testeur.referentiel().recharge({
        niveauxGravite: { unNiveau: {} },
        vraisemblancesRisques: { unNiveauVraisemblance: {} },
        categoriesRisques: { C1: {} },
      });
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

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'niveauGravite',
            'niveauVraisemblance',
            'commentaire',
            'description',
            'intitule',
            'categories.*',
          ],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/risquesSpecifiques',
          }
        );
    });

    it("retourne une erreur 400 si le niveau de gravité n'existe pas", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        {
          niveauGravite: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurNiveauGraviteInconnu');
    });

    it("retourne une erreur 400 si le niveau de vraisemblance n'existe pas", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        {
          niveauVraisemblance: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurNiveauVraisemblanceInconnu');
    });

    it("retourne une erreur 400 si l'intitulé est vide", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        { categories: ['C1'] }
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurIntituleRisqueManquant');
    });

    it("retourne une erreur 400 si la catégorie n'existe pas", async () => {
      const reponse = await testeur.post(
        '/api/service/456/risquesSpecifiques',
        { categories: ['inexistante'], intitule: 'un risque' }
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurCategorieRisqueInconnue');
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

      await testeur.post('/api/service/456/risquesSpecifiques', {
        intitule: 'un risque important',
        niveauGravite: 'unNiveau',
        niveauVraisemblance: 'unNiveauVraisemblance',
        commentaire: "c'est important",
        categories: ['C1'],
      });

      expect(idServiceRecu).toBe('456');
      expect(donneesRecues!.intitule).to.eql('un risque important');
      expect(donneesRecues!.niveauGravite).to.eql('unNiveau');
      expect(donneesRecues!.niveauVraisemblance).to.eql(
        'unNiveauVraisemblance'
      );
      expect(donneesRecues!.commentaire).to.eql("c'est important");
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
        {
          intitule: 'un risque important',
          niveauGravite: 'unNiveau',
          niveauVraisemblance: 'unNiveauVraisemblance',
          commentaire: "c'est important",
          categories: ['C1'],
        }
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

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: RISQUES }],
          testeur.app(),
          { method: 'put', url: '/api/service/456/risquesSpecifiques/RS1' }
        );
    });

    it('aseptise les paramètres de la requête', async () => {
      await testeur
        .middleware()
        .verifieAseptisationParametres(
          [
            'niveauGravite',
            'niveauVraisemblance',
            'commentaire',
            'description',
            'intitule',
            'categories.*',
          ],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/risquesSpecifiques/RS1',
          }
        );
    });

    it("retourne une erreur 400 si le niveau de gravité n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          niveauGravite: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );
      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurNiveauGraviteInconnu');
    });

    it("retourne une erreur 400 si le niveau de vraisemblance n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          niveauVraisemblance: 'inexistant',
          intitule: 'risque',
          categories: ['C1'],
        }
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurNiveauVraisemblanceInconnu');
    });

    it("retourne une erreur 400 si l'intitulé est vide", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        { categories: ['C1'] }
      );
      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurIntituleRisqueManquant');
    });

    it("retourne une erreur 400 si la catégorie n'existe pas", async () => {
      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        { categories: ['inexistante'], intitule: 'un risque' }
      );

      expect(reponse.status).toBe(400);
      expect(reponse.text).toBe('ErreurCategorieRisqueInconnue');
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
          url: '/api/service/456/risquesSpecifiques/INTROUVABLE',
          data: { intitule: 'un risque important', categories: ['C1'] },
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

      await testeur.put('/api/service/456/risquesSpecifiques/RS1', {
        intitule: 'un risque important',
        niveauGravite: 'unNiveau',
        niveauVraisemblance: 'unNiveauVraisemblance',
        commentaire: "c'est important",
        categories: ['C1'],
      });

      expect(idServiceRecu).toBe('456');
      expect(donneesRecues!.id).to.eql('RS1');
      expect(donneesRecues!.intitule).to.eql('un risque important');
      expect(donneesRecues!.niveauGravite).to.eql('unNiveau');
      expect(donneesRecues!.niveauVraisemblance).to.eql(
        'unNiveauVraisemblance'
      );
      expect(donneesRecues!.commentaire).to.eql("c'est important");
    });

    it('retourne la représentation du risque modifié', async () => {
      testeur.depotDonnees().metsAJourRisqueSpecifiqueDuService =
        async () => {};

      const reponse = await testeur.put(
        '/api/service/456/risquesSpecifiques/RS1',
        {
          intitule: 'un risque important',
          niveauGravite: 'unNiveau',
          niveauVraisemblance: 'unNiveauVraisemblance',
          commentaire: "c'est important",
          categories: ['C1'],
        }
      );

      expect(reponse.body.intitule).toBe('un risque important');
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
          { method: 'delete', url: '/api/service/456/risquesSpecifiques/RS1' }
        );
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

      await testeur.delete('/api/service/456/risquesSpecifiques/RS1');

      expect(idServiceRecu).toBe('456');
      expect(idRisqueRecu).toBe('RS1');
    });
  });
});
