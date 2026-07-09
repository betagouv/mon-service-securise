import DeveloppementFourniture from './developpementFourniture.js';
import Hebergement from './hebergement.js';
import MaintenanceService from './maintenanceService.js';
import PartiePrenanteSpecifique from './partiePrenanteSpecifique.js';
import SecuriteService from './securiteService.js';
import PartiePrenante from './partiePrenante.js';
import { ErreurTypeInconnu } from '../../erreurs.js';

const partiesPrenantesAutorises = [
  DeveloppementFourniture,
  Hebergement,
  MaintenanceService,
  PartiePrenanteSpecifique,
  SecuriteService,
];

export const fabriquePartiePrenante = {
  cree: (donnees: Record<string, unknown>): PartiePrenante => {
    const { type } = donnees;

    const ClassePartiePrenante = partiesPrenantesAutorises.find(
      (classe) => classe.name === type
    );
    if (!ClassePartiePrenante) {
      throw new ErreurTypeInconnu(`Le type "${type}" est inconnu`);
    }

    return new ClassePartiePrenante(donnees);
  },
};
