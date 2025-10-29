import { Request } from 'express';
import { UUID } from '../../typesBasiques.js';
import Service from '../../modeles/service.js';

export type RequestRouteConnecte = Request & {
  idUtilisateurCourant: UUID;
};

export type RequestRouteConnecteService = RequestRouteConnecte & {
  service: Service;
};
