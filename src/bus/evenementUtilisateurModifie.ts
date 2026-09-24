import { EvenementMetier } from './evenementMetier.js';
import Utilisateur from '../modeles/utilisateur.js';

type Donnees = { utilisateur: Utilisateur };

class EvenementUtilisateurModifie extends EvenementMetier<Donnees>([
  'utilisateur',
]) {}

export default EvenementUtilisateurModifie;
