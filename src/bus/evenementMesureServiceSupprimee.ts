import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';

type Donnees = { service: Service; utilisateur: Utilisateur; idMesure: string };

class EvenementMesureServiceSupprimee extends EvenementMetier<Donnees>([
  'service',
  'utilisateur',
  'idMesure',
]) {}

export default EvenementMesureServiceSupprimee;
