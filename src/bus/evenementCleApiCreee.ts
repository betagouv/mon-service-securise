import { CleApi } from '../modeles/cleApi.js';

export class EvenementCleApiCreee {
  readonly cle: CleApi;
  readonly dureeValiditeEnJours: number;

  constructor({
    cle,
    dureeValiditeEnJours,
  }: {
    cle: CleApi;
    dureeValiditeEnJours: number;
  }) {
    this.cle = cle;
    this.dureeValiditeEnJours = dureeValiditeEnJours;
  }
}
