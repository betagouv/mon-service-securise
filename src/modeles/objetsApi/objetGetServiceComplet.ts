import Service from '../service.js';
import { Autorisation } from '../autorisations/autorisation.js';
import * as objetGetMesures from './objetGetMesures.js';
import { Droits } from '../autorisations/gestionDroits.js';

const { DROITS_VOIR_DESCRIPTION, DROITS_VOIR_MESURES } = Autorisation;

export class ObjetGetServiceComplet {
  constructor(
    private readonly service: Service,
    private readonly autorisation: Autorisation
  ) {}

  donnees(): {
    descriptionService?: Record<string, unknown>;
    mesures?: Record<string, unknown>;
  } {
    return {
      ...(this.peut(DROITS_VOIR_DESCRIPTION) && {
        descriptionService: this.service.descriptionService.toJSON(),
      }),
      ...(this.peut(DROITS_VOIR_MESURES) && {
        mesures: objetGetMesures.donnees(this.service),
      }),
    };
  }

  private peut(droits: Partial<Droits>) {
    return this.autorisation.aLesPermissions(droits);
  }
}
