const expect = require('expect.js');
const {
  executeurApresAuthentification,
} = require('../../src/utilisateur/executeurApresAuthentification');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const SourceAuthentification = require('../../src/modeles/sourceAuthentification');

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
    it('redirige', async () => {
      const ordre = {
        type: 'redirection',
        cible: '/une-url',
      };

      await executeurApresAuthentification(ordre, { reponse });

      expect(reponse.urlRedirection).to.be('/une-url');
    });

    it("génère un token avec les données de l'ordre", async () => {
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

      await executeurApresAuthentification(ordre, { reponse, adaptateurJWT });

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

    it('rend une page', async () => {
      const ordre = {
        type: 'rendu',
        cible: 'un-pug',
      };

      await executeurApresAuthentification(ordre, { reponse });

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

      it("génère un token avec les données de l'ordre", async () => {
        await executeurApresAuthentification(ordre, { reponse, adaptateurJWT });

        expect(reponse.donneesDeRenduDePage).to.eql({
          tokenDonneesInvite: 'valeur-jwt',
        });
      });

      it("ajoute l'url de redirection si elle est fournie", async () => {
        await executeurApresAuthentification(ordre, {
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
      it("ajoute l'url de redirection si elle est fournie", async () => {
        const ordre = {
          type: 'rendu',
          cible: 'un-pug',
        };

        await executeurApresAuthentification(ordre, {
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

  describe("lorsqu'il y a un utilisateur à connecter", () => {
    let utilisateurAConnecter;
    let ordre;
    let serviceGestionnaireSession;
    let requete;
    let depotDonnees;

    beforeEach(() => {
      utilisateurAConnecter = unUtilisateur()
        .avecId('U1')
        .quiEstComplet()
        .construis();
      ordre = {
        utilisateurAConnecter,
      };
      serviceGestionnaireSession = {
        enregistreSession: () => {},
      };
      requete = {
        session: {},
      };
      depotDonnees = {
        enregistreNouvelleConnexionUtilisateur: async () => {},
      };
    });

    it('enregistre une session', async () => {
      let sessionEnregistree;
      serviceGestionnaireSession = {
        enregistreSession: (req, utilisateur, source) => {
          sessionEnregistree = { requete: req, utilisateur, source };
        },
      };
      await executeurApresAuthentification(ordre, {
        serviceGestionnaireSession,
        requete,
        depotDonnees,
      });

      expect(sessionEnregistree).not.to.be(undefined);
      expect(sessionEnregistree.requete).to.eql(requete);
      expect(sessionEnregistree.utilisateur).to.be(utilisateurAConnecter);
      expect(sessionEnregistree.source).to.be(
        SourceAuthentification.AGENT_CONNECT
      );
    });

    it("enregistre l'idToken de ProConnect", async () => {
      await executeurApresAuthentification(ordre, {
        serviceGestionnaireSession,
        requete,
        agentConnectIdToken: 'Un token ProConnect',
        depotDonnees,
      });

      expect(requete.session.AgentConnectIdToken).to.be('Un token ProConnect');
    });

    it('enregistre une nouvelle connexion', async () => {
      let connexionEnregistree;
      depotDonnees = {
        enregistreNouvelleConnexionUtilisateur: async (
          idUtilisateur,
          source
        ) => {
          connexionEnregistree = { idUtilisateur, source };
        },
      };

      await executeurApresAuthentification(ordre, {
        serviceGestionnaireSession,
        requete,
        agentConnectIdToken: 'Un token ProConnect',
        depotDonnees,
      });

      expect(connexionEnregistree).not.to.be(undefined);
      expect(connexionEnregistree.idUtilisateur).to.be('U1');
      expect(connexionEnregistree.source).to.be(
        SourceAuthentification.AGENT_CONNECT
      );
    });
  });
});
