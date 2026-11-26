import { IdMesure } from '../../referentiel.types.js';

export type DonneesMesures = {
  ajouter: readonly IdMesure[];
  retirer: readonly IdMesure[];
  rendreIndispensables: readonly IdMesure[];
};

class Mesures {
  readonly ajouter: readonly IdMesure[];
  readonly retirer: readonly IdMesure[];
  readonly rendreIndispensables: readonly IdMesure[];

  constructor({
    ajouter = [],
    retirer = [],
    rendreIndispensables = [],
  }: Partial<DonneesMesures> = {}) {
    this.ajouter = ajouter;
    this.retirer = retirer;
    this.rendreIndispensables = rendreIndispensables;
  }
}

export default Mesures;
