import { Response } from 'express';
import { executeurApresAuthentification } from '../../src/utilisateur/executeurApresAuthentification.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.js';
import { OrdreApresAuthentification } from '../../src/utilisateur/serviceApresAuthentification.ts';
import { AdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.interface.ts';
import {
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../../src/session/serviceGestionnaireSession.ts';
import { DepotDonnees } from '../../src/depotDonnees.interface.ts';
import { AdaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement.interface.ts';
import Utilisateur from '../../src/modeles/utilisateur.js';

class MockReponse {
  urlRedirection: string | undefined;
  pageRendue: string | undefined;
  donneesDeRenduDePage: Record<string, unknown> | undefined;

  redirect(cible: string) {
    this.urlRedirection = cible;
  }

  render(cible: string, donnees: Record<string, unknown>) {
    this.pageRendue = cible;
    this.donneesDeRenduDePage = donnees;
  }
}

describe("L'executeur après authentification", () => {
  let adaptateurJWT: AdaptateurJWT;
  let adaptateurEnvironnement: AdaptateurEnvironnement;
  let reponse: MockReponse;
  let serviceGestionnaireSession: ServiceGestionnaireSession;
  let requete: RequeteAvecSession;
  let depotDonnees: DepotDonnees;

  const donneesUtilisateur = {
    nom: 'Jean',
    prenom: 'Dujardin',
    email: 'jean.dujardin@beta.gouv.fr',
    organisation: {
      nom: 'ANSSI',
      departement: '75',
      siret: '1234',
    },
  };

  const executeurDuTest = async (
    ordre: OrdreApresAuthentification,
    configurationOptionnelle?: {
      urlRedirection?: string;
      connexionAvecMFA?: boolean;
      agentConnectIdToken?: string;
    }
  ) => {
    await executeurApresAuthentification(ordre, {
      adaptateurJWT,
      adaptateurEnvironnement,
      reponse: reponse as unknown as Response,
      requete,
      agentConnectIdToken: '',
      depotDonnees,
      serviceGestionnaireSession,
      ...(configurationOptionnelle && {
        urlRedirection: configurationOptionnelle.urlRedirection,
        connexionAvecMFA: configurationOptionnelle.connexionAvecMFA,
        agentConnectIdToken: configurationOptionnelle.agentConnectIdToken,
      }),
    });
  };

  beforeEach(() => {
    adaptateurJWT = {
      signeDonnees: () => 'données-signées',
    } as AdaptateurJWT;
    adaptateurEnvironnement = {
      mss: () => ({
        urlBase: () => '',
      }),
    } as AdaptateurEnvironnement;
    reponse = new MockReponse();
    requete = {
      session: {},
    } as RequeteAvecSession;
    serviceGestionnaireSession = {
      enregistreSession: () => {},
    } as unknown as ServiceGestionnaireSession;
    depotDonnees = {
      enregistreNouvelleConnexionUtilisateur: () => {},
    } as unknown as DepotDonnees;
  });

  describe("lorsque le type de l'ordre est une redirection", () => {
    const ordre: OrdreApresAuthentification = {
      type: 'redirection',
      cible: '/creation-compte',
      donnees: donneesUtilisateur,
    };

    it('redirige', async () => {
      await executeurDuTest(ordre);

      expect(reponse.urlRedirection).toBe(
        '/creation-compte?token=données-signées'
      );
    });

    it("génère un token avec les données de l'ordre", async () => {
      adaptateurJWT.signeDonnees = (donnees) => `${donnees.nom}-jwt`;

      await executeurDuTest(ordre);

      expect(reponse.urlRedirection).toBe('/creation-compte?token=Jean-jwt');
    });
  });

  describe("lorsque le type de l'ordre est un rendu", () => {
    beforeEach(() => {
      adaptateurEnvironnement = {
        mss: () => ({
          urlBase: () => 'http://mss',
        }),
      } as AdaptateurEnvironnement;
    });

    it('rend une page', async () => {
      const ordre: OrdreApresAuthentification = {
        type: 'rendu',
        cible: 'apresAuthentification',
        utilisateurAConnecter: unUtilisateur().construis(),
      };

      await executeurDuTest(ordre);

      expect(reponse.pageRendue).toBe('apresAuthentification');
    });

    describe('lorsque des données sont fournies', () => {
      let ordre: OrdreApresAuthentification;

      beforeEach(() => {
        adaptateurJWT = {
          signeDonnees: (donnees) => `${donnees.nom}-jwt`,
        } as AdaptateurJWT;
        ordre = {
          type: 'rendu',
          cible: 'apresAuthentification',
          donnees: donneesUtilisateur,
          utilisateurAConnecter: unUtilisateur().construis(),
        };
      });

      it("génère un token avec les données de l'ordre", async () => {
        await executeurDuTest(ordre);

        expect(reponse.donneesDeRenduDePage).toEqual({
          tokenDonneesInvite: 'Jean-jwt',
        });
      });

      it("ajoute l'url de redirection si elle est fournie", async () => {
        await executeurDuTest(ordre, { urlRedirection: '/tableau-bord' });

        expect(reponse.donneesDeRenduDePage).toEqual({
          urlRedirection: 'http://mss/tableau-bord',
          tokenDonneesInvite: 'Jean-jwt',
        });
      });
    });
    describe("lorsqu'aucune donnée n'est fournie", () => {
      it("ajoute l'url de redirection si elle est fournie", async () => {
        const ordre: OrdreApresAuthentification = {
          type: 'rendu',
          cible: 'apresAuthentification',
          utilisateurAConnecter: unUtilisateur().construis(),
        };

        await executeurDuTest(ordre, {
          urlRedirection: '/tableau-bord',
        });

        expect(reponse.donneesDeRenduDePage).toEqual({
          urlRedirection: 'http://mss/tableau-bord',
        });
      });
    });
  });

  describe("lorsqu'il y a un utilisateur à connecter", () => {
    let utilisateurAConnecter: Utilisateur;
    let ordre: OrdreApresAuthentification;

    beforeEach(() => {
      utilisateurAConnecter = unUtilisateur()
        .avecId('U1')
        .quiEstComplet()
        .construis();
      ordre = {
        type: 'rendu',
        cible: 'apresAuthentification',
        utilisateurAConnecter,
      };
    });

    it('enregistre une session', async () => {
      let sessionEnregistree;
      serviceGestionnaireSession.enregistreSession = (
        req,
        utilisateur,
        source,
        connexionAvecMFA
      ) => {
        sessionEnregistree = {
          requete: req,
          utilisateur,
          source,
          connexionAvecMFA,
        };
      };

      await executeurDuTest(ordre, {
        connexionAvecMFA: true,
      });

      expect(sessionEnregistree).not.toBe(undefined);
      expect(sessionEnregistree!.requete).toEqual(requete);
      expect(sessionEnregistree!.utilisateur).toBe(utilisateurAConnecter);
      expect(sessionEnregistree!.source).toBe(
        SourceAuthentification.AGENT_CONNECT
      );
      expect(sessionEnregistree!.connexionAvecMFA).toBe(true);
    });

    it("enregistre l'idToken de ProConnect", async () => {
      await executeurDuTest(ordre, {
        agentConnectIdToken: 'Un token ProConnect',
      });

      expect(requete.session.AgentConnectIdToken).toBe('Un token ProConnect');
    });

    it('enregistre une nouvelle connexion', async () => {
      let connexionEnregistree;
      depotDonnees.enregistreNouvelleConnexionUtilisateur = async (
        idUtilisateur,
        source,
        connexionAvecMFA
      ) => {
        connexionEnregistree = { idUtilisateur, source, connexionAvecMFA };
      };

      await executeurDuTest(ordre, {
        agentConnectIdToken: 'Un token ProConnect',
        connexionAvecMFA: true,
      });

      expect(connexionEnregistree).not.toBe(undefined);
      expect(connexionEnregistree!.idUtilisateur).toBe('U1');
      expect(connexionEnregistree!.source).toBe(
        SourceAuthentification.AGENT_CONNECT
      );
      expect(connexionEnregistree!.connexionAvecMFA).toBe(true);
    });
  });
});
