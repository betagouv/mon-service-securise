import { EvenementMetier } from './evenementMetier.js';
import Utilisateur from '../modeles/utilisateur.js';

type Donnees = { utilisateur: Utilisateur };

class EvenementUtilisateurInscrit extends EvenementMetier<Donnees>([
  'utilisateur',
]) {}

export default EvenementUtilisateurInscrit;
