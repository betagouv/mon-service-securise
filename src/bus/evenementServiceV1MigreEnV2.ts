import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';

type Donnees = { service: Service; utilisateur: Utilisateur };

class EvenementServiceV1MigreEnV2 extends EvenementMetier<Donnees>([
  'service',
  'utilisateur',
]) {}

export default EvenementServiceV1MigreEnV2;
