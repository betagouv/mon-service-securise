import {
  fabriqueServiceGestionnaireSession,
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../../src/session/serviceGestionnaireSession.js';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.js';
import Utilisateur from '../../src/modeles/utilisateur.js';

describe('Le service gestionnaire de session', () => {
  let gestionnaireSession: ServiceGestionnaireSession;

  beforeEach(() => {
    gestionnaireSession = fabriqueServiceGestionnaireSession();
  });

  describe("sur demande d'enregistrement de session", () => {
    let requete: RequeteAvecSession;
    let utilisateur: Utilisateur;

    beforeEach(() => {
      requete = {
        session: {},
      } as RequeteAvecSession;
      utilisateur = {
        accepteCGU: () => true,
        estUnInvite: () => true,
        genereToken: (source) => `un token de source ${source}`,
      } as Utilisateur;
    });

    it('enregistre `cguAcceptees` dans la session', async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.cguAcceptees).toBe(true);
    });

    it('enregistre `estInvite` dans la session', async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.estInvite).toBe(true);
    });

    it("enregistre le token JWT de l'utilisateur dans la session", async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.token).toBe('un token de source MSS');
    });
  });

  describe('sur demande de lecture de `cguAcceptees`', () => {
    it('peut lire depuis la session', () => {
      const requete = {
        session: { cguAcceptees: true },
      } as unknown as RequeteAvecSession;
      const cguAcceptees = gestionnaireSession.cguAcceptees(requete);

      expect(cguAcceptees).toBe(true);
    });

    it("reste robuste si la requête n'a pas de session", () => {
      const requete = { session: null } as unknown as RequeteAvecSession;
      const cguAcceptees = gestionnaireSession.cguAcceptees(requete);

      expect(cguAcceptees).toBe(undefined);
    });
  });
});
