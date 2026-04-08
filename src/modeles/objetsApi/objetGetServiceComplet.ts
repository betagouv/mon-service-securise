import Service from '../service.js';
import { Autorisation } from '../autorisations/autorisation.js';

export class ObjetGetServiceComplet {
  constructor(
    private readonly service: Service,
    private readonly autorisation: Autorisation
  ) {}

  donnees(): { descriptionService?: Record<string, unknown> } {
    return {
      descriptionService: this.autorisation.aLesPermissions(
        Autorisation.DROITS_VOIR_DESCRIPTION
      )
        ? this.service.descriptionService.toJSON()
        : undefined,
    };
  }
}
