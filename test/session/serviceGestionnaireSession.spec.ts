import {
  fabriqueServiceGestionnaireSession,
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../../src/session/serviceGestionnaireSession.js';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.js';
import Utilisateur from '../../src/modeles/utilisateur.js';
import { DepotDonneesSession } from '../../src/depots/depotDonneesSession.interface.ts';

describe('Le service gestionnaire de session', () => {
  let gestionnaireSession: ServiceGestionnaireSession;
  let depotDonnees: DepotDonneesSession;

  beforeEach(() => {
    depotDonnees = {
      revoqueJwt: async () => {},
    };
    gestionnaireSession = fabriqueServiceGestionnaireSession({ depotDonnees });
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

    it("enregistre la source d'authentification dans la session", async () => {
      gestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );
      expect(requete.session.sourceAuthentification).toBe('MSS');
    });

    describe("concernant l'utilisation du MFA", () => {
      it("indique que l'utilisateur utilise un MFA", () => {
        gestionnaireSession.enregistreSession(
          requete,
          utilisateur,
          SourceAuthentification.AGENT_CONNECT,
          true
        );
        expect(requete.session.connexionAvecMFA).toBe(true);
      });

      it("indique que l'utilisateur n'utilise pas un MFA par défaut", () => {
        gestionnaireSession.enregistreSession(
          requete,
          utilisateur,
          SourceAuthentification.AGENT_CONNECT
        );
        expect(requete.session.connexionAvecMFA).toBe(false);
      });
    });
  });

  describe('sur demande de révocation de session', () => {
    it('utilise le dépôt de données pour révoquer le JWT', async () => {
      let tokenRevoque;
      depotDonnees.revoqueJwt = async (jwt: string) => {
        tokenRevoque = jwt;
      };

      const requete = {
        session: { token: 'jwt-du-test' },
      } as unknown as RequeteAvecSession;
      await gestionnaireSession.revoqueSession(requete);

      expect(tokenRevoque).toBe('jwt-du-test');
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
