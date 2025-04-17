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
    let adaptateurEnvironnement;

    beforeEach(() => {
      adaptateurEnvironnement = {
        mss: () => ({
          urlBase: () => 'http://mss',
        }),
      };
    });

    it('rend une page', () => {
      const ordre = {
        type: 'rendu',
        cible: 'un-pug',
      };

      executeurApresAuthentification(ordre, { reponse });

      expect(reponse.pageRendue).to.be('un-pug');
    });

    describe('lorsque des données sont fournies', () => {
      let adaptateurJWT;
      let ordre;

      beforeEach(() => {
        adaptateurJWT = {
          signeDonnees: (donnees) => `${donnees.champ}-jwt`,
        };
        ordre = {
          type: 'rendu',
          cible: 'un-pug',
          donnees: {
            champ: 'valeur',
          },
        };
      });

      it("génère un token avec les données de l'ordre", () => {
        executeurApresAuthentification(ordre, { reponse, adaptateurJWT });

        expect(reponse.donneesDeRenduDePage).to.eql({
          tokenDonneesInvite: 'valeur-jwt',
        });
      });

      it("ajoute l'url de redirection si elle est fournie", () => {
        executeurApresAuthentification(ordre, {
          reponse,
          adaptateurEnvironnement,
          urlRedirection: '/tableau-bord',
          adaptateurJWT,
        });

        expect(reponse.donneesDeRenduDePage).to.eql({
          urlRedirection: 'http://mss/tableau-bord',
          tokenDonneesInvite: 'valeur-jwt',
        });
      });
    });
    describe("lorsqu'aucune donnée n'est fournie", () => {
      it("ajoute l'url de redirection si elle est fournie", () => {
        const ordre = {
          type: 'rendu',
          cible: 'un-pug',
        };

        executeurApresAuthentification(ordre, {
          reponse,
          adaptateurEnvironnement,
          urlRedirection: '/tableau-bord',
        });

        expect(reponse.donneesDeRenduDePage).to.eql({
          urlRedirection: 'http://mss/tableau-bord',
        });
      });
    });
  });
});
