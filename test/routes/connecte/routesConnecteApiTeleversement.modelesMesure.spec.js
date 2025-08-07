const axios = require('axios');
const expect = require('expect.js');
const testeurMSS = require('../testeurMSS');
const { ErreurFichierXlsInvalide } = require('../../../src/erreurs');

describe('Les routes connecté de téléversement des modèles de mesure spécifique', () => {
  const testeur = testeurMSS();
  beforeEach(testeur.initialise);
  afterEach(testeur.arrete);

  it("vérifie que l'utilisateur est authentifié, 1 seul test suffit car le middleware est placé au niveau de l'instanciation du routeur", (done) => {
    testeur.middleware().verifieRequeteExigeAcceptationCGU(
      {
        method: 'post',
        url: 'http://localhost:1234/api/televersement/modelesMesureSpecifique',
      },
      done
    );
  });

  describe('Quand requête POST sur `/api/televersement/modelesMesureSpecifique`', () => {
    it('applique une protection de trafic', (done) => {
      testeur.middleware().verifieProtectionTrafic(
        {
          method: 'post',
          url: 'http://localhost:1234/api/televersement/modelesMesureSpecifique',
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

      await axios.post(
        'http://localhost:1234/api/televersement/modelesMesureSpecifique'
      );

      expect(adaptateurAppele).to.be(true);
      expect(requeteRecue).not.to.be(undefined);
    });

    it('jette une erreur 400 si le fichier est invalide', async () => {
      testeur.lecteurDeFormData().extraisDonneesXLS = async () => {
        throw new ErreurFichierXlsInvalide();
      };

      try {
        await axios.post(
          'http://localhost:1234/api/televersement/modelesMesureSpecifique'
        );
        expect().fail("L'appel aurait dû lever une erreur");
      } catch (e) {
        expect(e.response.status).to.be(400);
      }
    });

    it("délègue la conversion du contenu à l'adaptateur de lecture de données téléversées", async () => {
      let adaptateurAppele = false;
      let bufferRecu;
      testeur.adaptateurTeleversementModelesMesureSpecifique().extraisDonneesTeleversees =
        async (buffer) => {
          adaptateurAppele = true;
          bufferRecu = buffer;
        };

      await axios.post(
        'http://localhost:1234/api/televersement/modelesMesureSpecifique'
      );

      expect(adaptateurAppele).to.be(true);
      expect(bufferRecu).not.to.be(undefined);
    });
  });
});
