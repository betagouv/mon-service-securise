const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { ErreurFichierXlsInvalide } = require('../../../src/erreurs');

describe('Les routes connecté de téléversement', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('Pour les téléversements de services', () => {
    beforeEach(() => {
      testeur.depotDonnees().nouveauTeleversementServices = async () => {};
    });

    describe('Quand requête POST sur `/api/televersement/services`', () => {
      it("vérifie que l'utilisateur est authentifié", (done) => {
        testeur.middleware().verifieRequeteExigeAcceptationCGU(
          {
            method: 'post',
            url: 'http://localhost:1234/api/televersement/services',
          },
          done
        );
      });

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
  });
});
