import { IdMesure } from '../../referentiel.types.js';

export type DonneesMesures = {
  ajouter: IdMesure[];
  retirer: IdMesure[];
  rendreIndispensables: IdMesure[];
};

class Mesures {
  readonly ajouter: IdMesure[];
  readonly retirer: IdMesure[];
  readonly rendreIndispensables: IdMesure[];

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
