import { Request } from 'express';
import Utilisateur from '../modeles/utilisateur.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

export interface RequeteAvecSession extends Request {
  session: Record<string, unknown>;
}

export const fabriqueServiceGestionnaireSession = () => ({
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
});

export type ServiceGestionnaireSession = ReturnType<
  typeof fabriqueServiceGestionnaireSession
>;
