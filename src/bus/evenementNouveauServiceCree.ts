import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';

type Donnees = { service: Service; utilisateur: Utilisateur };

export class EvenementNouveauServiceCree extends EvenementMetier<Donnees>([
  'service',
  'utilisateur',
]) {}
