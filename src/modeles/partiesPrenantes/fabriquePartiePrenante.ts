import DeveloppementFourniture from './developpementFourniture.js';
import Hebergement from './hebergement.js';
import MaintenanceService from './maintenanceService.js';
import PartiePrenanteSpecifique from './partiePrenanteSpecifique.js';
import SecuriteService from './securiteService.js';
import { ErreurTypeInconnu } from '../../erreurs.js';
import PartiePrenante from './partiePrenante.js';

const partiesPrenantesAutorises: Array<typeof PartiePrenante> = [
  DeveloppementFourniture,
  Hebergement,
  MaintenanceService,
  PartiePrenanteSpecifique,
  SecuriteService,
];

export const fabriquePartiePrenante = {
  cree: (donnees: Record<string, unknown>) => {
    const { type } = donnees;

    if (!partiesPrenantesAutorises.some((classe) => classe.name === type)) {
      throw new ErreurTypeInconnu(`Le type "${type}" est inconnu`);
    }

    const ClassePartiePrenante = partiesPrenantesAutorises.find(
      (classe) => classe.name === type
    )!;
    return new ClassePartiePrenante(donnees);
  },
};
