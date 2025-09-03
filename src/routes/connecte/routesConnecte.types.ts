import { Request } from 'express';
import { UUID } from '../../typesBasiques.js';

export type RequestRouteConnecte = Request & {
  idUtilisateurCourant: UUID;
};
