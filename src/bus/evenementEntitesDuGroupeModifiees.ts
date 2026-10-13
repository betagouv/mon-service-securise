import { GroupeEntites } from '../modeles/groupeEntites.js';

export class EvenementEntitesDuGroupeModifiees {
  readonly groupe: GroupeEntites;

  constructor({ groupe }: { groupe: GroupeEntites }) {
    this.groupe = groupe;
  }
}
