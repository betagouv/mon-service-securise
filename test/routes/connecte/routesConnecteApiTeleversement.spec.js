const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const {
  ErreurFichierXlsInvalide,
  ErreurTeleversementServicesInvalide,
} = require('../../../src/erreurs');
const TeleversementServices = require('../../../src/modeles/televersement/televersementServices');
const Referentiel = require('../../../src/referentiel');
const donneesReferentiel = require('../../../donneesReferentiel');

describe('Les routes connecté de téléversement', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('Pour les téléversements de services', () => {
    beforeEach(() => {
      testeur.depotDonnees().nouveauTeleversementServices = async () => {};
    });

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
        testeur.adaptateurControleFichier().extraisDonneesXLS = async (
          requete
        ) => {
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
        testeur.adaptateurXLS().extraisTeleversementServices = async (
          buffer
        ) => {
          adaptateurAppele = true;
          bufferRecu = buffer;
        };

        await axios.post('http://localhost:1234/api/televersement/services');

        expect(adaptateurAppele).to.be(true);
        expect(bufferRecu).not.to.be(undefined);
      });

      it('jette une erreur 400 si le fichier est invalide', async () => {
        testeur.adaptateurControleFichier().extraisDonneesXLS = async () => {
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
        testeur.adaptateurXLS().extraisTeleversementServices = async () => [
          { nom: 'Un service' },
        ];
        let donneesRecues;
        let idUtilisateurCourantRecue;
        testeur.depotDonnees().nouveauTeleversementServices = async (
          idUtilisateurCourant,
          donnees
        ) => {
          donneesRecues = donnees;
          idUtilisateurCourantRecue = idUtilisateurCourant;
        };

        await axios.post('http://localhost:1234/api/televersement/services');

        expect(idUtilisateurCourantRecue).to.equal('123');
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

      it('renvoie une réponse 200 si un téléversement a été supprimé', async () => {
        testeur.depotDonnees().supprimeTeleversementServices = async () => 1;
        const reponse = await axios.delete(
          'http://localhost:1234/api/televersement/services'
        );

        expect(reponse.status).to.be(200);
      });

      it("renvoie une réponse 404 si aucun téléversement n'existe pour cet utilisateur", async () => {
        testeur.depotDonnees().supprimeTeleversementServices = async () => 0;

        try {
          await axios.delete(
            'http://localhost:1234/api/televersement/services'
          );
          expect().fail("L'appel aurait dû lever une erreur");
        } catch (e) {
          expect(e.response.status).to.be(404);
        }
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
        testeur.depotDonnees().supprimeTeleversementServices = async () => {};
        testeur.depotDonnees().lisTeleversementServices = async () =>
          televersementService;
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
        let donneesRecues;
        televersementService.creeLesServices = async (
          idUtilisateur,
          nomServicesExistants,
          depotDonnees,
          busEvenements
        ) => {
          donneesRecues = {
            idUtilisateur,
            nomServicesExistants,
            depotDonnees,
            busEvenements,
          };
        };

        await axios.post(
          'http://localhost:1234/api/televersement/services/confirme'
        );

        expect(donneesRecues.idUtilisateur).to.be('123');
        expect(donneesRecues.nomServicesExistants).to.eql([]);
        expect(donneesRecues.depotDonnees).not.to.be(undefined);
        expect(donneesRecues.busEvenements).not.to.be(undefined);
      });

      it('délègue la suppression du téléversement de service au dépôt de données', async () => {
        let idUtilisateurRecu;
        testeur.depotDonnees().supprimeTeleversementServices = async (
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

      it('renvoie une erreur 400 si le téléversement est invalide', async () => {
        televersementService.creeLesServices = async () => {
          throw new ErreurTeleversementServicesInvalide();
        };

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
  });
});
