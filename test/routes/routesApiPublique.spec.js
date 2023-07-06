const axios = require('axios');
const expect = require('expect.js');

const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes publiques /api/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête POST sur `/api/desinscriptionInfolettre`', () => {
    const donneesRequete = {
      email: 'jean.dujardin@mail.com',
      event: 'unsubscribe',
    };

    it("retourne une erreur HTTP 400 si l'événement n'est pas une désinscription", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        { erreur: "L'événement doit être de type 'unsubscribe'" },
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
        },
        done
      );
    });

    it("retourne une erreur HTTP 400 si le champ email n'est pas présent", (done) => {
      testeur.verifieRequeteGenereErreurHTTP(
        400,
        { erreur: "Le champ 'email' doit être présent" },
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
          data: { event: 'unsubscribe' },
        },
        done
      );
    });

    it("retourne une erreur HTTP 424 si l'adresse email est introuvable", (done) => {
      testeur.depotDonnees().utilisateurAvecEmail = () =>
        Promise.resolve(undefined);

      testeur.verifieRequeteGenereErreurHTTP(
        424,
        { erreur: "L'email 'jean.dujardin@mail.com' est introuvable" },
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
          data: donneesRequete,
        },
        done
      );
    });

    it("vérifie l'adresse IP de la requête", (done) => {
      testeur.middleware().verifieAdresseIP(
        ['185.107.232.1/24', '1.179.112.1/20'],
        {
          method: 'post',
          url: 'http://localhost:1234/api/desinscriptionInfolettre',
          data: donneesRequete,
        },
        done
      );
    });

    it("désabonne l'utilisateur de l'infolettre", (done) => {
      const utilisateur = { id: '123', infolettreAcceptee: true };
      testeur.depotDonnees().utilisateurAvecEmail = (email) => {
        expect(email).to.equal('jean.dujardin@mail.com');
        return Promise.resolve(utilisateur);
      };
      testeur.depotDonnees().metsAJourUtilisateur = (id, donnees) => {
        expect(id).to.equal('123');
        expect(donnees.id).to.equal('123');
        expect(donnees.infolettreAcceptee).to.be(false);
        return Promise.resolve();
      };

      axios
        .post(
          'http://localhost:1234/api/desinscriptionInfolettre',
          donneesRequete
        )
        .then(() => done())
        .catch((e) => done(e.response?.data || e));
    });
  });
});
