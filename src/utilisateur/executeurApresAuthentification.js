import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

const executeurApresAuthentification = async (
  ordre,
  {
    requete,
    reponse,
    agentConnectIdToken,
    adaptateurJWT,
    depotDonnees,
    urlRedirection,
    adaptateurEnvironnement,
    serviceGestionnaireSession,
  }
) => {
  if (ordre.utilisateurAConnecter) {
    serviceGestionnaireSession.enregistreSession(
      requete,
      ordre.utilisateurAConnecter,
      SourceAuthentification.AGENT_CONNECT
    );
    requete.session.AgentConnectIdToken = agentConnectIdToken;
    await depotDonnees.enregistreNouvelleConnexionUtilisateur(
      ordre.utilisateurAConnecter.id,
      SourceAuthentification.AGENT_CONNECT
    );
  }

  switch (ordre.type) {
    case 'rendu':
      reponse.render(ordre.cible, {
        ...(ordre.donnees && {
          tokenDonneesInvite: adaptateurJWT.signeDonnees(ordre.donnees),
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
        const token = adaptateurJWT.signeDonnees(ordre.donnees);
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
