import testeurMSS from '../testeurMSS.js';
import { ErreurFichierXlsInvalide } from '../../../src/erreurs.js';
import { UUID } from '../../../src/typesBasiques.js';
import { LigneServiceTeleverseV2 } from '../../../src/modeles/televersement/serviceTeleverseV2.js';
import { VersionService } from '../../../src/modeles/versionService.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import TeleversementServicesV2 from '../../../src/modeles/televersement/televersementServicesV2.ts';
import { unUUID } from '../../constructeurs/UUID.ts';

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

  describe('Quand requête GET sur `/api/televersement/services-v2`', () => {
    const donneesServiceValide: LigneServiceTeleverseV2 = {
      nom: 'Mon service',
      siret: '13000000000000',
      statutDeploiement: 'En conception',
      typeService: ['Service en ligne', 'API'],
      typeHebergement: 'Hébergement interne (On-premise)',
      ouvertureSysteme: 'Accessible depuis internet',
      audienceCible: 'Large',
      dureeDysfonctionnementAcceptable: 'Moins de 4h',
      volumetrieDonneesTraitees: 'Faible',
      localisationDonneesTraitees: "Au sein de l'Union européenne",
      dateHomologation: new Date('2025-01-31'),
      dureeHomologation: '6 mois',
      nomAutoriteHomologation: 'Nom Prénom',
      fonctionAutoriteHomologation: 'Fonction',
    };

    let referentiel;
    let televersementService: TeleversementServicesV2;

    beforeEach(() => {
      referentiel = creeReferentielV2();
      televersementService = new TeleversementServicesV2(
        { services: [structuredClone(donneesServiceValide)] },
        referentiel
      );
      testeur.middleware().reinitialise({ idUtilisateur: unUUID('2') });
      testeur.depotDonnees().services = async () => [];
      testeur.depotDonnees().lisTeleversementServices = async () =>
        televersementService;
    });

    it('délègue la récupération des noms de services existants au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().services = async (idUtilisateur: UUID) => {
        idUtilisateurRecu = idUtilisateur;
        return [];
      };

      await testeur.get('/api/televersement/services-v2');

      expect(idUtilisateurRecu).toBe(unUUID('2'));
    });

    it('délègue la récupération du téléversement de service au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisTeleversementServices = async (
        idUtilisateur: UUID
      ) => {
        idUtilisateurRecu = idUtilisateur;
        return televersementService;
      };

      await testeur.get('/api/televersement/services-v2');

      expect(idUtilisateurRecu).toBe(unUUID('2'));
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisTeleversementServices = async () => undefined;

      const reponse = await testeur.get('/api/televersement/services-v2');

      expect(reponse.status).toBe(404);
    });

    it('retourne le rapport détaillé du téléversement de service', async () => {
      const reponse = await testeur.get('/api/televersement/services-v2');

      expect(reponse.body.statut).toBe('VALIDE');
      expect(reponse.body.services[0].service).toEqual({
        ...donneesServiceValide,
        dateHomologation: '2025-01-31T00:00:00.000Z',
      });
      expect(reponse.body.services[0].erreurs.length).toBe(0);
    });
  });
});
