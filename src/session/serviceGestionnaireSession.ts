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
    source: SourceAuthentification
  ) => {
    requete.session.token = utilisateur.genereToken(source);
    requete.session.cguAcceptees = utilisateur.accepteCGU();
    requete.session.estInvite = utilisateur.estUnInvite();
  },
  cguAcceptees: (requete: RequeteAvecSession) => requete.session?.cguAcceptees,
});

export type ServiceGestionnaireSession = ReturnType<
  typeof fabriqueServiceGestionnaireSession
>;
