import { CleApi } from '../modeles/cleApi.js';

export class EvenementCleApiRevoquee {
  readonly cle: CleApi;

  constructor({ cle }: { cle: CleApi }) {
    this.cle = cle;
  }
}
