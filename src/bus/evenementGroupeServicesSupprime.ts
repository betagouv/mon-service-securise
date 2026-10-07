import { GroupeServices } from '../modeles/groupeServices.js';

export class EvenementGroupeServicesSupprime {
  readonly groupe: GroupeServices;

  constructor({ groupe }: { groupe: GroupeServices }) {
    this.groupe = groupe;
  }
}
