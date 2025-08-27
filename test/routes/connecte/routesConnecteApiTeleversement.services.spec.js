import axios from 'axios';
import expect from 'expect.js';
import testeurMSS from '../testeurMSS.js';
import { ErreurFichierXlsInvalide } from '../../../src/erreurs.js';
import TeleversementServices from '../../../src/modeles/televersement/televersementServices.js';
import * as Referentiel from '../../../src/referentiel.js';
import donneesReferentiel from '../../../donneesReferentiel.js';

describe('Les routes connecté de téléversement de services', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  beforeEach(() => {
    testeur.depotDonnees().nouveauTeleversementServices = async () => {};
  });

  afterEach(testeur.arrete);

  it("vérifie que l'utilisateur est authentifié, 1 seul test suffit car le middleware est placé au niveau de l'instanciation du routeur", (done) => {
    testeur.middleware().verifieRequeteExigeAcceptationCGU(
      {
        method: 'post',
        url: 'http://localhost:1234/api/televersement/services',
      },
      done
    );
  });

  describe('Quand requête POST sur `/api/televersement/services`', () => {
    it('applique une protection de trafic', (done) => {
      testeur.middleware().verifieProtectionTrafic(
        {
          method: 'post',
          url: 'http://localhost:1234/api/televersement/services',
        },
        done
      );
    });

    it("délègue la vérification de surface à l'adaptateur de vérification de fichier", async () => {
      let adaptateurAppele = false;
      let requeteRecue;
      testeur.lecteurDeFormData().extraisDonneesXLS = async (requete) => {
        adaptateurAppele = true;
        requeteRecue = requete;
      };

      await axios.post('http://localhost:1234/api/televersement/services');

      expect(adaptateurAppele).to.be(true);
      expect(requeteRecue).not.to.be(undefined);
    });

    it("délègue la conversion du contenu à l'adaptateur XLS", async () => {
      let adaptateurAppele = false;
      let bufferRecu;
      testeur.adaptateurTeleversementServices().extraisTeleversementServices =
        async (buffer) => {
          adaptateurAppele = true;
          bufferRecu = buffer;
        };

      await axios.post('http://localhost:1234/api/televersement/services');

      expect(adaptateurAppele).to.be(true);
      expect(bufferRecu).not.to.be(undefined);
    });

    it('jette une erreur 400 si le fichier est invalide', async () => {
      testeur.lecteurDeFormData().extraisDonneesXLS = async () => {
        throw new ErreurFichierXlsInvalide();
      };

      try {
        await axios.post('http://localhost:1234/api/televersement/services');
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e.response.status).to.be(400);
      }
    });

    it('délègue au dépôt de données la sauvegarde du téléversement', async () => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.adaptateurTeleversementServices().extraisTeleversementServices =
        async () => [{ nom: 'Un service' }];
      let idUtilisateurQuiTeleverse;
      let donneesRecues;
      testeur.depotDonnees().nouveauTeleversementServices = async (
        idUtilisateurCourant,
        donnees
      ) => {
        idUtilisateurQuiTeleverse = idUtilisateurCourant;
        donneesRecues = donnees;
      };

      await axios.post('http://localhost:1234/api/televersement/services');

      expect(idUtilisateurQuiTeleverse).to.equal('123');
      expect(donneesRecues).to.eql([{ nom: 'Un service' }]);
    });
  });

  describe('Quand requête GET sur `/api/televersement/services`', () => {
    const donneesServiceValide = {
      nom: 'Nom du service',
      siret: '13000000000000',
      nombreOrganisationsUtilisatrices: '2',
      type: 'Site Internet',
      provenance: 'Proposé en ligne par un fournisseur',
      statut: 'En projet',
      localisation: 'France',
      delaiAvantImpactCritique: "Plus d'une journée",
      dateHomologation: '01/01/2025',
      dureeHomologation: '6 mois',
      nomAutoriteHomologation: 'Nom Prénom',
      fonctionAutoriteHomologation: 'Fonction',
    };
    let referentiel;
    let televersementService;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        ...donneesReferentiel,
      });
      televersementService = new TeleversementServices(
        { services: [structuredClone(donneesServiceValide)] },
        referentiel
      );
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.depotDonnees().services = async () => [];
      testeur.depotDonnees().lisTeleversementServices = async () =>
        televersementService;
    });

    it('délègue la récupération des noms de services existants au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().services = async (idUtilisateur) => {
        idUtilisateurRecu = idUtilisateur;
        return [];
      };

      await axios.get('http://localhost:1234/api/televersement/services');

      expect(idUtilisateurRecu).to.be('123');
    });

    it('délègue la récupération du téléversement de service au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisTeleversementServices = async (
        idUtilisateur
      ) => {
        idUtilisateurRecu = idUtilisateur;
        return televersementService;
      };

      await axios.get('http://localhost:1234/api/televersement/services');

      expect(idUtilisateurRecu).to.be('123');
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisTeleversementServices = async () => undefined;

      try {
        await axios.get('http://localhost:1234/api/televersement/services');
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e.response.status).to.be(404);
      }
    });

    it('retourne le rapport détaillé du téléversement de service', async () => {
      const reponse = await axios.get(
        'http://localhost:1234/api/televersement/services'
      );

      expect(reponse.data.statut).to.be('VALIDE');
      expect(reponse.data.services[0].service).to.eql(donneesServiceValide);
      expect(reponse.data.services[0].erreurs.length).to.be(0);
    });
  });

  describe('Quand requête DELETE sur `/api/televersement/services`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
      testeur.depotDonnees().supprimeTeleversementServices = async () => true;
    });

    it('renvoie une réponse 200 ', async () => {
      testeur.depotDonnees().supprimeTeleversementServices = async () => 1;
      const reponse = await axios.delete(
        'http://localhost:1234/api/televersement/services'
      );

      expect(reponse.status).to.be(200);
    });
  });

  describe('Quand requête POST sur `/api/televersement/services/confirme`', () => {
    const donneesServiceValide = {
      nom: 'Nom du service',
      siret: '13000000000000',
      nombreOrganisationsUtilisatrices: '2',
      type: 'Site Internet',
      provenance: 'Proposé en ligne par un fournisseur',
      statut: 'En projet',
      localisation: 'France',
      delaiAvantImpactCritique: "Plus d'une journée",
      dateHomologation: '01/01/2025',
      dureeHomologation: '6 mois',
      nomAutoriteHomologation: 'Nom Prénom',
      fonctionAutoriteHomologation: 'Fonction',
    };
    let referentiel;
    let televersementService;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        ...donneesReferentiel,
      });
      televersementService = new TeleversementServices(
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
      const reponse = await axios.post(
        'http://localhost:1234/api/televersement/services/confirme'
      );

      expect(reponse.status).to.be(201);
    });

    it('délègue la récupération des noms de services existants au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().services = async (idUtilisateur) => {
        idUtilisateurRecu = idUtilisateur;
        return [];
      };

      await axios.post(
        'http://localhost:1234/api/televersement/services/confirme'
      );

      expect(idUtilisateurRecu).to.be('123');
    });

    it('délègue la récupération du téléversement de service au dépôt de données', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisTeleversementServices = async (
        idUtilisateur
      ) => {
        idUtilisateurRecu = idUtilisateur;
        return televersementService;
      };

      await axios.post(
        'http://localhost:1234/api/televersement/services/confirme'
      );

      expect(idUtilisateurRecu).to.be('123');
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisTeleversementServices = async () => undefined;

      try {
        await axios.post(
          'http://localhost:1234/api/televersement/services/confirme'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e.response.status).to.be(404);
      }
    });

    it('créé les services via le modèle métier', async () => {
      const resolutionPromesse = {
        resous: () => {},
        resolue: false,
      };
      const promesse = new Promise((resolve) => {
        resolutionPromesse.resous = () => {
          resolve();
          resolutionPromesse.resolue = true;
        };
      });

      let donneesRecues;
      televersementService.creeLesServices = async (
        idUtilisateur,
        depotDonnees,
        busEvenements
      ) => {
        donneesRecues = { idUtilisateur, depotDonnees, busEvenements };
        return promesse;
      };

      await axios.post(
        'http://localhost:1234/api/televersement/services/confirme'
      );

      expect(resolutionPromesse.resolue).to.be(false);
      resolutionPromesse.resous();

      expect(resolutionPromesse.resolue).to.be(true);
      expect(donneesRecues.idUtilisateur).to.be('123');
      expect(donneesRecues.depotDonnees).not.to.be(undefined);
      expect(donneesRecues.busEvenements).not.to.be(undefined);
    });

    it('renvoie une erreur 400 si le téléversement est invalide', async () => {
      televersementService = new TeleversementServices(
        { services: [{ ...donneesServiceValide, type: 'pasUnType' }] },
        referentiel
      );

      try {
        await axios.post(
          'http://localhost:1234/api/televersement/services/confirme'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e.response.status).to.be(400);
      }
    });
  });

  describe('Quand requête GET sur `/api/televersement/services/progression`', () => {
    beforeEach(() => {
      testeur.middleware().reinitialise({ idUtilisateur: '123' });
    });

    it('retourne le pourcentage de progression', async () => {
      let idUtilisateurRecu;
      testeur.depotDonnees().lisPourcentageProgressionTeleversementServices =
        async (idUtilisateur) => {
          idUtilisateurRecu = idUtilisateur;
          return 50;
        };

      const reponse = await axios.get(
        'http://localhost:1234/api/televersement/services/progression'
      );

      expect(idUtilisateurRecu).to.be('123');
      expect(reponse.status).to.be(200);
      expect(reponse.data.progression).to.be(50);
    });

    it("renvoie une erreur 404 si l'utilisateur n'a pas de téléversement en cours", async () => {
      testeur.depotDonnees().lisPourcentageProgressionTeleversementServices =
        async () => undefined;

      try {
        await axios.get(
          'http://localhost:1234/api/televersement/services/progression'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e.response.status).to.be(404);
      }
    });
  });
});
