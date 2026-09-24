import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';
import DescriptionService from '../modeles/descriptionService.js';
import { DescriptionServiceV2 } from '../modeles/descriptionServiceV2.js';

type Donnees = {
  service: Service;
  utilisateur: Utilisateur;
  ancienneDescription: DescriptionService | DescriptionServiceV2;
};

export class EvenementDescriptionServiceModifiee extends EvenementMetier<Donnees>(
  ['service', 'utilisateur', 'ancienneDescription']
) {}
