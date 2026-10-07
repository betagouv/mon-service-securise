import { GroupeServices } from '../modeles/groupeServices.js';

export class EvenementServicesDuGroupeModifies {
  readonly groupe: GroupeServices;
  readonly nombreServicesAssocies: number;

  constructor({ groupe }: { groupe: GroupeServices }) {
    this.groupe = groupe;
    this.nombreServicesAssocies = groupe.donnees().idServicesAssocies.length;
  }
}
