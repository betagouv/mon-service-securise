import { Response } from 'express';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';
import { OrdreApresAuthentification } from './serviceApresAuthentification.js';
import { AdaptateurJWT } from '../adaptateurs/adaptateurJWT.interface.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.interface.js';
import {
  RequeteAvecSession,
  ServiceGestionnaireSession,
} from '../session/serviceGestionnaireSession.js';
import { UUID } from '../typesBasiques.js';
import { TokenMSSPourCreationUtilisateur } from './tokenMSSPourCreationUtilisateur.js';

const executeurApresAuthentification = async (
  ordre: OrdreApresAuthentification,
  {
    requete,
    reponse,
    agentConnectIdToken,
    adaptateurJWT,
    depotDonnees,
    urlRedirection,
    adaptateurEnvironnement,
    serviceGestionnaireSession,
    connexionAvecMFA,
  }: {
    requete: RequeteAvecSession;
    reponse: Response;
    agentConnectIdToken: string;
    adaptateurJWT: AdaptateurJWT;
    depotDonnees: DepotDonnees;
    urlRedirection?: string;
    adaptateurEnvironnement: AdaptateurEnvironnement;
    serviceGestionnaireSession: ServiceGestionnaireSession;
    connexionAvecMFA?: boolean;
  }
) => {
  if (ordre.type === 'rendu' && ordre.utilisateurAConnecter) {
    serviceGestionnaireSession.enregistreSession(
      requete,
      ordre.utilisateurAConnecter,
      SourceAuthentification.AGENT_CONNECT,
      connexionAvecMFA
    );

    const idUtilisateur = ordre.utilisateurAConnecter.id as UUID;
    const estAdmin = await depotDonnees.estAdmin(idUtilisateur);
    const estSuperviseur = await depotDonnees.estSuperviseur(idUtilisateur);

    reponse.locals.utilisateurConnecteEstAdmin = estAdmin;
    reponse.locals.utilisateurConnecteEstSuperviseur = estSuperviseur;

    requete.session.AgentConnectIdToken = agentConnectIdToken;

    await depotDonnees.enregistreNouvelleConnexionUtilisateur(
      idUtilisateur,
      SourceAuthentification.AGENT_CONNECT,
      connexionAvecMFA
    );
  }

  switch (ordre.type) {
    case 'rendu':
      reponse.render(ordre.cible, {
        ...(ordre.donnees && {
          tokenDonneesInvite: new TokenMSSPourCreationUtilisateur(
            adaptateurJWT
          ).cree(ordre.donnees),
        }),
        ...(urlRedirection && {
          urlRedirection: `${adaptateurEnvironnement
            .mss()
            .urlBase()}${urlRedirection}`,
        }),
      });
      break;
    case 'redirection':
      if (ordre.donnees) {
        const token = new TokenMSSPourCreationUtilisateur(adaptateurJWT).cree(
          ordre.donnees
        );
        reponse.redirect(`${ordre.cible}?token=${token}`);
      } else {
        reponse.redirect(`${ordre.cible}`);
      }
      break;
    default:
      break;
  }
};
export { executeurApresAuthentification };
