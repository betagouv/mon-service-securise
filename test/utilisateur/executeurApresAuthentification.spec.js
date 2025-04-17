const expect = require('expect.js');
const {
  executeurApresAuthentification,
} = require('../../src/utilisateur/executeurApresAuthentification');

class MockReponse {
  redirect(cible) {
    this.urlRedirection = cible;
  }

  render(cible, donnees) {
    this.pageRendue = cible;
    this.donneesDeRenduDePage = donnees;
  }
}

describe("L'executeur après authentification", () => {
  let reponse;
  beforeEach(() => {
    reponse = new MockReponse();
  });
  describe("lorsque le type de l'ordre est une redirection", () => {
    it('redirige', () => {
      const ordre = {
        type: 'redirection',
        cible: '/une-url',
      };

      executeurApresAuthentification(ordre, { reponse });

      expect(reponse.urlRedirection).to.be('/une-url');
    });

    it("génère un token avec les données de l'ordre", () => {
      const ordre = {
        type: 'redirection',
        cible: '/une-url',
        donnees: {
          champ: 'valeur',
        },
      };
      const adaptateurJWT = {
        signeDonnees: (donnees) => `${donnees.champ}-jwt`,
      };

      executeurApresAuthentification(ordre, { reponse, adaptateurJWT });

      expect(reponse.urlRedirection).to.be('/une-url?token=valeur-jwt');
    });
  });

  describe("lorsque le type de l'ordre est un rendu", () => {
    it('rend une page', () => {
      const ordre = {
        type: 'rendu',
        cible: 'un-pug',
      };

      executeurApresAuthentification(ordre, { reponse });

      expect(reponse.pageRendue).to.be('un-pug');
    });

    it("génère un token avec les données de l'ordre", () => {
      const ordre = {
        type: 'rendu',
        cible: 'un-pug',
        donnees: {
          champ: 'valeur',
        },
      };
      const adaptateurJWT = {
        signeDonnees: (donnees) => `${donnees.champ}-jwt`,
      };

      executeurApresAuthentification(ordre, { reponse, adaptateurJWT });

      expect(reponse.donneesDeRenduDePage).to.eql({
        tokenDonneesInvite: 'valeur-jwt',
      });
    });
  });
});
