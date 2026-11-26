import testeurMSS from '../testeurMSS.js';
import { UUID } from '../../../src/typesBasiques.js';
import { LigneServiceTeleverseV2 } from '../../../src/modeles/televersement/serviceTeleverseV2.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import TeleversementServicesV2 from '../../../src/modeles/televersement/televersementServicesV2.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { ReferentielV2 } from '../../../src/referentiel.interface.ts';

describe('Les routes connecté de téléversement de services V2', () => {
  const testeur = testeurMSS();
  beforeEach(() => testeur.initialise());
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

    const unServiceTeleverse = () => ({
      nom: 'Mon service',
      siret: '130 000 000 00000',
      statutDeploiement: 'En conception',
      typeService: ['Service en ligne', 'API'],
      typeHebergement: 'Hébergement interne (On-premise)',
      ouvertureSysteme: 'Accessible depuis internet',
      audienceCible: 'Large',
      dureeDysfonctionnementAcceptable: 'Moins de 4h',
      volumetrieDonneesTraitees: 'Faible',
      localisationDonneesTraitees: "Au sein de l'Union européenne",
      dateHomologation: '31/01/2025',
      dureeHomologation: '6 mois',
      nomAutoriteHomologation: 'Nom Prénom',
      fonctionAutoriteHomologation: 'Fonction',
    });

    const posteLesServices = (services: unknown) =>
      testeur.post('/api/televersement/services-v2', { services });

    describe('concernant la validation de la payload', () => {
      it('jette une erreur 400 si la liste des services est absente', async () => {
        const reponse = await testeur.post('/api/televersement/services-v2');

        expect(reponse.status).toBe(400);
      });

      it('jette une erreur 400 si la payload contient une propriété inconnue', async () => {
        const reponse = await testeur.post('/api/televersement/services-v2', {
          services: [unServiceTeleverse()],
          inconnue: 'X',
        });

        expect(reponse.status).toBe(400);
      });

      it('jette une erreur 400 si un service contient une propriété inconnue', async () => {
        const reponse = await posteLesServices([
          { ...unServiceTeleverse(), inconnue: 'X' },
        ]);

        expect(reponse.status).toBe(400);
      });

      it("jette une erreur 400 s'il manque une propriété à un service", async () => {
        const serviceSansNom: Partial<ReturnType<typeof unServiceTeleverse>> =
          unServiceTeleverse();
        delete serviceSansNom.nom;

        const reponse = await posteLesServices([serviceSansNom]);

        expect(reponse.status).toBe(400);
      });

      it("jette une erreur 400 si une propriété n'est pas une chaîne de caractères", async () => {
        const reponse = await posteLesServices([
          { ...unServiceTeleverse(), nom: { $ne: '' } },
        ]);

        expect(reponse.status).toBe(400);
      });

      it('jette une erreur 400 si une chaîne dépasse 1000 caractères', async () => {
        const reponse = await posteLesServices([
          { ...unServiceTeleverse(), nom: 'X'.repeat(1001) },
        ]);

        expect(reponse.status).toBe(400);
      });

      it('jette une erreur 400 si un service a plus de 5 types', async () => {
        const reponse = await posteLesServices([
          { ...unServiceTeleverse(), typeService: Array(6).fill('API') },
        ]);

        expect(reponse.status).toBe(400);
      });

      it('jette une erreur 400 au-delà de 250 services', async () => {
        const reponse = await posteLesServices(
          Array(251).fill(unServiceTeleverse())
        );

        expect(reponse.status).toBe(400);
      });

      it('accepte 250 services, même si la payload dépasse 100 ko', async () => {
        const payload = {
          services: Array(250).fill({
            ...unServiceTeleverse(),
            nom: 'X'.repeat(1000),
          }),
        };
        expect(JSON.stringify(payload).length).toBeGreaterThan(100 * 1024);

        const reponse = await testeur.post(
          '/api/televersement/services-v2',
          payload
        );

        expect(reponse.status).toBe(201);
      });

      it('laisse au rapport de téléversement le soin de signaler les erreurs métier, comme un statut inconnu', async () => {
        const reponse = await posteLesServices([
          { ...unServiceTeleverse(), statutDeploiement: 'Statut inconnu' },
        ]);

        expect(reponse.status).toBe(201);
      });
    });

    describe('concernant la sauvegarde du téléversement', () => {
      let idUtilisateurQuiTeleverse: UUID | undefined;
      let donneesRecues: LigneServiceTeleverseV2[];

      beforeEach(() => {
        idUtilisateurQuiTeleverse = undefined;
        donneesRecues = [];
        testeur.middleware().reinitialise({ idUtilisateur: '123' });
        testeur.depotDonnees().nouveauTeleversementServices = async (
          idUtilisateurCourant: UUID,
          donnees: LigneServiceTeleverseV2[]
        ) => {
          idUtilisateurQuiTeleverse = idUtilisateurCourant;
          donneesRecues = donnees;
        };
      });

      it('délègue au dépôt de données la sauvegarde des services reçus', async () => {
        const reponse = await posteLesServices([unServiceTeleverse()]);

        expect(reponse.status).toBe(201);
        expect(idUtilisateurQuiTeleverse).toBe('123');
        expect(donneesRecues).toEqual([
          {
            ...unServiceTeleverse(),
            dateHomologation: new Date('2025-01-31'),
          },
        ]);
      });

      it("ne renseigne pas de date d'homologation si elle est vide", async () => {
        await posteLesServices([
          { ...unServiceTeleverse(), dateHomologation: '' },
        ]);

        expect(donneesRecues[0].dateHomologation).toBe(undefined);
      });

      it("transmet une date invalide si la date d'homologation est illisible, pour que le rapport la signale", async () => {
        await posteLesServices([
          { ...unServiceTeleverse(), dateHomologation: 'pas une date' },
        ]);

        const dateRecue = donneesRecues[0].dateHomologation!;
        expect(Number.isNaN(dateRecue.valueOf())).toBe(true);
      });
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

  describe('Quand requête DELETE sur `/api/televersement/services-v2`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.depotDonnees().supprimeTeleversementServices = async () => true;
    });

    it('renvoie une réponse 200', async () => {
      testeur.depotDonnees().supprimeTeleversementServices = async () => 1;
      const reponse = await testeur.delete('/api/televersement/services-v2');

      expect(reponse.status).toBe(200);
    });
  });

  describe('Quand requête POST sur `/api/televersement/services-v2/confirme`', () => {
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
    let referentiel: ReferentielV2;
    let televersementService: TeleversementServicesV2;

    beforeEach(() => {
      referentiel = creeReferentielV2();
      televersementService = new TeleversementServicesV2(
        { services: [structuredClone(donneesServiceValide)] },
        referentiel
      );
      televersementService.creeLesServices = async () => {};
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.depotDonnees().services = async () => [];
      testeur.depotDonnees().lisTeleversementServices = async () =>
        televersementService;
    });

    it('répond 201', async () => {
      const reponse = await testeur.post(
        '/api/televersement/services-v2/confirme'
      );

      expect(reponse.status).toBe(201);
    });

    it('délègue la récupération des noms de services existants au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().services = async (idUtilisateur: UUID) => {
        idUtilisateurRecu = idUtilisateur;
        return [];
      };

      await testeur.post('/api/televersement/services-v2/confirme');

      expect(idUtilisateurRecu).toBe('123');
    });

    it('délègue la récupération du téléversement de service au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisTeleversementServices = async (
        idUtilisateur: UUID
      ) => {
        idUtilisateurRecu = idUtilisateur;
        return televersementService;
      };

      await testeur.post('/api/televersement/services-v2/confirme');

      expect(idUtilisateurRecu).toBe('123');
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisTeleversementServices = async () => undefined;

      const reponse = await testeur.post(
        '/api/televersement/services-v2/confirme'
      );

      expect(reponse.status).toBe(404);
    });

    it('créé les services via le modèle métier', async () => {
      let donneesRecues;
      televersementService.creeLesServices = async (
        idUtilisateur,
        depotDonnees,
        busEvenements
      ) => {
        donneesRecues = { idUtilisateur, depotDonnees, busEvenements };
      };

      await testeur.post('/api/televersement/services-v2/confirme');

      expect(donneesRecues!.idUtilisateur).toBe('123');
      expect(donneesRecues!.depotDonnees).not.toBe(undefined);
      expect(donneesRecues!.busEvenements).not.toBe(undefined);
    });

    it('renvoie une erreur 400 si le téléversement est invalide', async () => {
      televersementService = new TeleversementServicesV2(
        { services: [{ ...donneesServiceValide, siret: 'pasUnSiret' }] },
        referentiel
      );

      const reponse = await testeur.post(
        '/api/televersement/services-v2/confirme'
      );

      expect(reponse.status).toBe(400);
    });
  });

  describe('Quand requête GET sur `/api/televersement/services-v2/progression`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
    });

    it('retourne le pourcentage de progression', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisPourcentageProgressionTeleversementServices =
        async (idUtilisateur: UUID) => {
          idUtilisateurRecu = idUtilisateur;
          return 50;
        };

      const reponse = await testeur.get(
        '/api/televersement/services-v2/progression'
      );

      expect(idUtilisateurRecu).toBe('123');
      expect(reponse.status).toBe(200);
      expect(reponse.body.progression).toBe(50);
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisPourcentageProgressionTeleversementServices =
        async () => undefined;

      const reponse = await testeur.get(
        '/api/televersement/services-v2/progression'
      );

      expect(reponse.status).toBe(404);
    });
  });
});
