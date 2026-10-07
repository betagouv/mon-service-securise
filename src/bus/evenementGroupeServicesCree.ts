import { GroupeServices } from '../modeles/groupeServices.js';

export class EvenementGroupeServicesCree {
  readonly groupe: GroupeServices;

  constructor({ groupe }: { groupe: GroupeServices }) {
    this.groupe = groupe;
  }
}
