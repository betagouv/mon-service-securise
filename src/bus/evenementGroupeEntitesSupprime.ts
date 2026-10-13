import { GroupeEntites } from '../modeles/groupeEntites.js';

export class EvenementGroupeEntitesSupprime {
  readonly groupe: GroupeEntites;

  constructor({ groupe }: { groupe: GroupeEntites }) {
    this.groupe = groupe;
  }
}
