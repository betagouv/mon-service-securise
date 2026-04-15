import Service from '../service.js';
import { Autorisation } from '../autorisations/autorisation.js';
import * as objetGetMesures from './objetGetMesures.js';
import { Droits } from '../autorisations/gestionDroits.js';
import RisqueGeneral from '../risqueGeneral.js';
import { TousReferentiels } from '../../referentiel.interface.js';

const { DROITS_VOIR_DESCRIPTION, DROITS_VOIR_MESURES, DROITS_VOIR_RISQUES } =
  Autorisation;

type RisquesAPI = {
  risquesGeneraux: Array<Record<string, unknown>>;
  risquesSpecifiques: Array<Record<string, unknown>>;
};

export class ObjetGetServiceComplet {
  constructor(
    private readonly service: Service,
    private readonly autorisation: Autorisation,
    private readonly referentiel: TousReferentiels
  ) {}

  donnees(): {
    descriptionService?: Record<string, unknown>;
    mesures?: Record<string, unknown>;
    risques?: RisquesAPI;
  } {
    const { risquesGeneraux, risquesSpecifiques } =
      this.service.risques.toJSON() as RisquesAPI;
    const risquesGenerauxAConsiderer = Object.keys(this.referentiel.risques())
      .map((id) => risquesGeneraux.find((r) => r.id === id) || { id })
      .map((donnees) => new RisqueGeneral(donnees, this.referentiel).toJSON());

    return {
      ...(this.peut(DROITS_VOIR_DESCRIPTION) && {
        descriptionService: this.service.descriptionService.toJSON(),
      }),
      ...(this.peut(DROITS_VOIR_MESURES) && {
        mesures: objetGetMesures.donnees(this.service),
      }),
      ...(this.peut(DROITS_VOIR_RISQUES) && {
        risques: {
          risquesGeneraux: risquesGenerauxAConsiderer,
          risquesSpecifiques,
        },
      }),
    };
  }

  private peut(droits: Partial<Droits>) {
    return this.autorisation.aLesPermissions(droits);
  }
}
