import { Request } from 'express';
import Utilisateur from '../modeles/utilisateur.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';
import { DepotDonneesSession } from '../depots/depotDonneesSession.interface.js';

export interface RequeteAvecSession extends Request {
  session: Record<string, unknown>;
}

export const fabriqueServiceGestionnaireSession = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesSession;
}) => ({
  enregistreSession: (
    requete: RequeteAvecSession,
    utilisateur: Utilisateur,
    source: SourceAuthentification,
    connexionAvecMFA?: boolean
  ) => {
    requete.session.token = utilisateur.genereToken(source);
    requete.session.cguAcceptees = utilisateur.accepteCGU();
    requete.session.estInvite = utilisateur.estUnInvite();
    requete.session.sourceAuthentification = source;
    requete.session.connexionAvecMFA = connexionAvecMFA || false;
  },

  cguAcceptees: (requete: RequeteAvecSession) => requete.session?.cguAcceptees,

  async revoqueSession(requete: RequeteAvecSession) {
    await depotDonnees.revoqueJwt(requete.session.token as string);
  },
});

export type ServiceGestionnaireSession = ReturnType<
  typeof fabriqueServiceGestionnaireSession
>;
