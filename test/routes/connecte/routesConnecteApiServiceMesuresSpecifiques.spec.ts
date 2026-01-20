import { unService } from '../../constructeurs/constructeurService.js';
import testeurMSS from '../testeurMSS.js';
import {
  ErreurMesureInconnue,
  ErreurSuppressionImpossible,
} from '../../../src/erreurs.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';
import Mesures from '../../../src/modeles/mesures.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import MesureSpecifique from '../../../src/modeles/mesureSpecifique.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

describe('Les routes des mesures spécifiques de service', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  describe('quand requête POST sur `api/service/:id/mesuresSpecifiques`', () => {
    const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
      description: 'une description',
      descriptionLongue: 'des détails',
      categorie: 'gouvernance',
      statut: 'fait',
      priorite: '',
      modalites: '',
      echeance: '1/7/2025',
      ...cleValeur,
    });

    beforeEach(() => {
      testeur.depotDonnees().ajouteMesureSpecifiqueAuService = async () => {};
      testeur.referentiel().enrichis({
        categoriesMesures: { gouvernance: '' },
      });
    });

    it('retourne une réponse 201', async () => {
      const reponse = await testeur.post(
        '/api/service/456/mesuresSpecifiques',
        unePayloadValideSauf()
      );

      expect(reponse.status).toBe(201);
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'post',
          url: '/api/service/456/mesuresSpecifiques',
          data: [],
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'post',
            url: '/api/service/456/mesuresSpecifiques',
            data: [],
          }
        );
    });

    it("délègue au dépôt de données l'ajout de la mesure spécifique", async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
      let idServiceRecu;
      let mesureRecue;
      let idUtilisateurRecu;
      testeur.depotDonnees().ajouteMesureSpecifiqueAuService = async (
        mesure: MesureSpecifique,
        idUtilisateur: UUID,
        idService: UUID
      ) => {
        mesureRecue = mesure;
        idUtilisateurRecu = idUtilisateur;
        idServiceRecu = idService;
      };

      await testeur.post(
        '/api/service/456/mesuresSpecifiques',
        unePayloadValideSauf()
      );

      expect(idServiceRecu).toBe('456');
      expect(idUtilisateurRecu).toBe('999');
      expect(mesureRecue!.description).toBe('une description');
      expect(mesureRecue!.descriptionLongue).toBe('des détails');
      expect(mesureRecue!.categorie).toBe('gouvernance');
      expect(mesureRecue!.statut).toBe('fait');
    });

    describe('jette une erreur 400 si', () => {
      it.each([
        { description: undefined },
        { categorie: undefined },
        { statut: 'pasUnStatut' },
        { priorite: 'invalide' },
        { echeance: 'invalide' },
        { modalites: 123 },
        { responsables: ['pasUnUUID'] },
        { descriptionLongue: 123 },
      ])('la payload contient %s', async (donneeDuTest) => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf(donneeDuTest)
        );

        expect(status).toBe(400);
      });
    });

    describe('… mais accepte une payload avec', () => {
      it.each([
        { priorite: '' },
        { responsables: undefined },
        { descriptionLongue: undefined },
      ])('%s', async (donneesDuTest) => {
        const { status } = await testeur.post(
          '/api/service/456/mesuresSpecifiques',
          unePayloadValideSauf(donneesDuTest)
        );

        expect(status).toBe(201);
      });
    });
  });

  describe('quand requête PUT sur `api/service/:id/mesuresSpecifiques/:idMesure`', () => {
    const unePayloadValideSauf = (cleValeur?: Record<string, unknown>) => ({
      description: 'une description',
      descriptionLongue: 'des détails',
      categorie: 'gouvernance',
      statut: 'fait',
      priorite: '',
      modalites: '',
      echeance: '01/20/2026',
      ...cleValeur,
    });

    beforeEach(() => {
      testeur.depotDonnees().metsAJourMesureSpecifiqueDuService =
        async () => {};
      testeur.referentiel().enrichis({
        categoriesMesures: { gouvernance: '' },
      });
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecMesures(new Mesures({ mesuresSpecifiques: [{ id: 'M1' }] }))
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'put',
          url: '/api/service/456/mesuresSpecifiques/789',
          data: [],
        });
    });

    describe('jette une erreur 400 si', () => {
      it("l'ID de mesure est invalide", async () => {
        const { status } = await testeur.put(
          '/api/service/456/mesuresSpecifiques/pasUnUUID',
          unePayloadValideSauf()
        );

        expect(status).toBe(400);
      });

      it.each([
        { description: undefined },
        { categorie: undefined },
        { statut: 'pasUnStatut' },
        { priorite: 'invalide' },
        { echeance: 'invalide' },
        { modalites: 123 },
        { responsables: ['pasUnUUID'] },
        { descriptionLongue: 123 },
      ])('la payload contient %s', async (donneeDuTest) => {
        const { status } = await testeur.put(
          `/api/service/456/mesuresSpecifiques/${unUUIDRandom()}`,
          unePayloadValideSauf(donneeDuTest)
        );

        expect(status).toBe(400);
      });
    });

    describe('… mais accepte une payload avec', () => {
      it.each([
        { priorite: '' },
        { responsables: undefined },
        { descriptionLongue: undefined },
      ])('%s', async (donneesDuTest) => {
        const { status } = await testeur.put(
          `/api/service/456/mesuresSpecifiques/${unUUIDRandom()}`,
          unePayloadValideSauf(donneesDuTest)
        );

        expect(status).toBe(200);
      });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'put',
            url: '/api/service/456/mesuresSpecifiques/789',
            data: [],
          }
        );
    });

    it('délègue au dépôt de données la mise à jour de la mesure spécifique', async () => {
      let idServiceRecu;
      let idUtilisateurRecu;
      let mesureRecue;
      testeur.depotDonnees().metsAJourMesureSpecifiqueDuService = async (
        idService: UUID,
        idUtilisateur: UUID,
        mesure: MesureSpecifique
      ) => {
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
        mesureRecue = mesure;
      };

      await testeur.put(
        `/api/service/456/mesuresSpecifiques/${unUUIDRandom()}`,
        unePayloadValideSauf()
      );

      expect(idServiceRecu).toBe('456');
      expect(idUtilisateurRecu).toBe('999');
      expect(mesureRecue!.description).toBe('une description');
      expect(mesureRecue!.categorie).toBe('gouvernance');
      expect(mesureRecue!.statut).toBe('fait');
      expect(mesureRecue!.echeance.getTime()).toBe(
        new Date('01/20/2026').getTime()
      );
    });

    it('renvoi une erreur 404 si la mesure est introuvable', async () => {
      testeur.depotDonnees().metsAJourMesureSpecifiqueDuService = async () => {
        throw new ErreurMesureInconnue();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        'La mesure est introuvable',
        {
          method: 'put',
          url: `/api/service/456/mesuresSpecifiques/${unUUIDRandom()}`,
          data: unePayloadValideSauf(),
        }
      );
    });
  });

  describe('quand requête DELETE sur `api/service/:id/mesuresSpecifiques/:idMesure`', () => {
    beforeEach(() => {
      testeur.depotDonnees().supprimeMesureSpecifiqueDuService = async () => {};
    });

    it("vérifie que l'utilisateur est authentifié", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeAcceptationCGU(testeur.app(), {
          method: 'delete',
          url: '/api/service/456/mesuresSpecifiques/789',
          data: [],
        });
    });

    it('recherche le service correspondant', async () => {
      await testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: ECRITURE, rubrique: SECURISER }],
          testeur.app(),
          {
            method: 'delete',
            url: '/api/service/456/mesuresSpecifiques/789',
            data: [],
          }
        );
    });

    it('délègue au dépôt de données la suppression de la mesure spécifique', async () => {
      const serviceARenvoyer = unService(testeur.referentiel())
        .avecId('456')
        .avecMesures(new Mesures({ mesuresSpecifiques: [{ id: 'M1' }] }))
        .construis();
      testeur.middleware().reinitialise({
        idUtilisateur: '999',
        serviceARenvoyer,
      });
      let idServiceRecu;
      let idUtilisateurRecu;
      let idMesureRecue;
      testeur.depotDonnees().supprimeMesureSpecifiqueDuService = async (
        idService: UUID,
        idUtilisateur: UUID,
        idMesure: UUID
      ) => {
        idServiceRecu = idService;
        idUtilisateurRecu = idUtilisateur;
        idMesureRecue = idMesure;
      };

      expect(serviceARenvoyer.nombreMesuresSpecifiques()).to.eql(1);
      await testeur.delete('/api/service/456/mesuresSpecifiques/M1');

      expect(idServiceRecu).toBe('456');
      expect(idUtilisateurRecu).toBe('999');
      expect(idMesureRecue).toBe('M1');
    });

    it('jette une erreur si la mesure spécifique est associée à un modèle', async () => {
      testeur.depotDonnees().supprimeMesureSpecifiqueDuService = async () => {
        throw new ErreurSuppressionImpossible();
      };

      const reponse = await testeur.delete(
        '/api/service/456/mesuresSpecifiques/M1'
      );
      expect(reponse.status).toBe(400);
    });
  });
});
