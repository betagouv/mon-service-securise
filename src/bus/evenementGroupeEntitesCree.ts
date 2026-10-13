import { GroupeEntites } from '../modeles/groupeEntites.js';

export class EvenementGroupeEntitesCree {
  readonly groupe: GroupeEntites;

  constructor({ groupe }: { groupe: GroupeEntites }) {
    this.groupe = groupe;
  }
}
