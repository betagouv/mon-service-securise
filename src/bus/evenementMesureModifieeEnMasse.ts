import { EvenementMetier } from './evenementMetier.js';
import Utilisateur from '../modeles/utilisateur.js';

type Donnees = {
  utilisateur: Utilisateur;
  idMesure?: string;
  statutModifie: boolean;
  modalitesModifiees: boolean;
  nombreServicesConcernes: number;
  typeMesure: 'generale' | 'specifique';
};

class EvenementMesureModifieeEnMasse extends EvenementMetier<Donnees>([
  'utilisateur',
  'statutModifie',
  'modalitesModifiees',
  'nombreServicesConcernes',
  'typeMesure',
]) {}

export default EvenementMesureModifieeEnMasse;
