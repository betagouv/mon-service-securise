import testeurMSS from '../testeurMSS.js';
import { ErreurFichierXlsInvalide } from '../../../src/erreurs.js';
import { UUID } from '../../../src/typesBasiques.js';
import { LigneServiceTeleverseV2 } from '../../../src/modeles/televersement/serviceTeleverseV2.js';
import { VersionService } from '../../../src/modeles/versionService.js';

describe('Les routes connecté de téléversement de services V2', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  beforeEach(() => {
    testeur.depotDonnees().nouveauTeleversementServices = async () => {};
  });

  it("vérifie que l'utilisateur est authentifié, 1 seul test suffit car le middleware est placé au niveau de l'instanciation du routeur", async () => {
    await testeur
      .middleware()
      .verifieRequeteExigeAcceptationCGU(testeur.app(), {
        method: 'post',
        url: '/api/televersement/services-v2',
      });
  });

  describe('Quand requête POST sur `/api/televersement/services-v2`', () => {
    it('applique une protection de trafic', async () => {
      await testeur.middleware().verifieProtectionTrafic(testeur.app(), {
        method: 'post',
        url: '/api/televersement/services-v2',
      });
    });

    it("délègue la vérification de surface à l'adaptateur de vérification de fichier", async () => {
      let adaptateurAppele = false;
      let requeteRecue;
      testeur.lecteurDeFormData().extraisDonneesXLS = async (
        requete: Request
      ) => {
        adaptateurAppele = true;
        requeteRecue = requete;
      };

      await testeur.post('/api/televersement/services-v2');

      expect(adaptateurAppele).toBe(true);
      expect(requeteRecue).not.toBe(undefined);
    });

    it("délègue la conversion du contenu à l'adaptateur XLS", async () => {
      let adaptateurAppele = false;
      let bufferRecu;
      testeur.adaptateurTeleversementServices().extraisTeleversementServicesV2 =
        async (buffer: Buffer) => {
          adaptateurAppele = true;
          bufferRecu = buffer;
        };

      await testeur.post('/api/televersement/services-v2');

      expect(adaptateurAppele).toBe(true);
      expect(bufferRecu).not.toBe(undefined);
    });

    it('jette une erreur 400 si le fichier est invalide', async () => {
      testeur.lecteurDeFormData().extraisDonneesXLS = async () => {
        throw new ErreurFichierXlsInvalide();
      };

      const reponse = await testeur.post('/api/televersement/services-v2');

      expect(reponse.status).toBe(400);
    });

    it('délègue au dépôt de données la sauvegarde du téléversement', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.adaptateurTeleversementServices().extraisTeleversementServicesV2 =
        async () => [{ nom: 'Un service' }];
      let idUtilisateurQuiTeleverse;
      let donneesRecues;
      let versionRecue: VersionService;
      testeur.depotDonnees().nouveauTeleversementServices = async (
        idUtilisateurCourant: UUID,
        donnees: LigneServiceTeleverseV2[],
        versionService: VersionService
      ) => {
        idUtilisateurQuiTeleverse = idUtilisateurCourant;
        donneesRecues = donnees;
        versionRecue = versionService;
      };

      await testeur.post('/api/televersement/services-v2');

      expect(idUtilisateurQuiTeleverse).toBe('123');
      expect(donneesRecues).toEqual([{ nom: 'Un service' }]);
      expect(versionRecue!).toBe('v2');
    });
  });
});
