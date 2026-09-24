import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';
import Mesure from '../modeles/mesure.js';

type Donnees = {
  service: Service;
  utilisateur: Utilisateur;
  ancienneMesure?: Mesure;
  nouvelleMesure: Mesure;
  typeMesure: 'generale' | 'specifique';
};

class EvenementMesureServiceModifiee extends EvenementMetier<Donnees>([
  'service',
  'utilisateur',
  'nouvelleMesure',
  'typeMesure',
]) {}

export default EvenementMesureServiceModifiee;
