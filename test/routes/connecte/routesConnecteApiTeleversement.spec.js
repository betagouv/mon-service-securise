const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { ErreurFichierXlsInvalide } = require('../../../src/erreurs');

describe('Les routes connecté de téléversement', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('Pour les téléversements de services', () => {
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

      it("délègue la vérification de surface à l'adaptateur de vérification de fichier", async () => {
        let adaptateurAppele = false;
        let requeteRecue;
        testeur.adaptateurControleFichier().verifieFichierXls = async (
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
        testeur.adaptateurControleFichier().verifieFichierXls = async () => {
          throw new ErreurFichierXlsInvalide();
        };

        try {
          await axios.post('http://localhost:1234/api/televersement/services');
          expect().fail("L'appel aurait dû lever une erreur");
        } catch (e) {
          expect(e.response.status).to.be(400);
        }
      });
    });
  });
});
