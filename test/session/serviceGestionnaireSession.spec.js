import expect from 'expect.js';
import { fabriqueServiceGestionnaireSession } from '../../src/session/serviceGestionnaireSession.js';
import SourceAuthentification from '../../src/modeles/sourceAuthentification.js';

describe('Le service gestionnaire de session', () => {
  let gestionnaireSession;

  beforeEach(() => {
    gestionnaireSession = fabriqueServiceGestionnaireSession();
  });

  describe("sur demande d'enregistrement de session", () => {
    let requete;
    let utilisateur;

    beforeEach(() => {
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

  describe('sur demande de lecture de `cguAcceptees`', () => {
    it('peut lire depuis la session', () => {
      const requete = { session: { cguAcceptees: true } };
      const cguAcceptees = gestionnaireSession.cguAcceptees(requete);

      expect(cguAcceptees).to.be(true);
    });

    it("reste robuste si la requête n'a pas de session", () => {
      const requete = { session: null };
      const cguAcceptees = gestionnaireSession.cguAcceptees(requete);

      expect(cguAcceptees).to.be(undefined);
    });
  });
});
