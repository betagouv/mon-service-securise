const expect = require('expect.js');
const {
  fabriqueServiceGestionnaireSession,
} = require('../../src/session/serviceGestionnaireSession');
const SourceAuthentification = require('../../src/modeles/sourceAuthentification');

describe('Le service gestionnaire de session', () => {
  describe("sur demande d'enregistrement de session", () => {
    let gestionnaireSession;
    let requete;
    let utilisateur;

    beforeEach(() => {
      gestionnaireSession = fabriqueServiceGestionnaireSession();
      requete = {
        session: {},
      };
      utilisateur = {
        accepteCGU: () => 'CGU',
        estUnInvite: () => 'INVITÉ',
        genereToken: (source) => `un token de source ${source}`,
      };
    });

    it('enregistre `cguAcceptees` dans la session', async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.cguAcceptees).to.be('CGU');
    });

    it('enregistre `estInvite` dans la session', async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.estInvite).to.be('INVITÉ');
    });

    it("enregistre le token JWT de l'utilisateur dans la session", async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.token).to.be('un token de source MSS');
    });
  });
});
