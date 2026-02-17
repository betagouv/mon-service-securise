/* eslint-disable no-empty-function */
import Service from '../../modeles/service.js';
import {
  ConfigurationPourNiveau,
  ConfigurationVraisemblancePourUnVecteur,
  IdentifiantGroupeMesureVraisemblance,
  PoidsGroupeMesure,
  Vraisemblance,
} from './vraisemblance/vraisemblance.types.js';
import {
  IdMesureV2,
  NiveauSecurite,
} from '../../../donneesReferentielMesuresV2.js';
import MesureGenerale from '../../modeles/mesureGenerale.js';

export class VraisemblanceRisque {
  constructor(
    private readonly configuration: ConfigurationVraisemblancePourUnVecteur
  ) {}

  calculePourService(service: Service): Vraisemblance {
    const configurationPourNiveauSecurite = this.configuration[
      service.descriptionService.niveauSecurite as NiveauSecurite
    ] as ConfigurationPourNiveau;

    const mesuresPersonnalisees =
      service.mesures.enrichiesAvecDonneesPersonnalisees()
        .mesuresGenerales as unknown as Record<IdMesureV2, MesureGenerale>;

    const groupes = Object.fromEntries(
      Object.entries(configurationPourNiveauSecurite.groupes).map(
        ([cleGroupe, groupe]) => [
          cleGroupe,
          groupe.idsMesures.map(
            (id) => mesuresPersonnalisees[id] || { statut: '' }
          ),
        ]
      )
    ) as Record<IdentifiantGroupeMesureVraisemblance, MesureGenerale[]>;

    const poids = Object.fromEntries(
      Object.entries(configurationPourNiveauSecurite.groupes).map(
        ([cleGroupe, groupe]) => [
          `poids${cleGroupe.toUpperCase()}`,
          groupe.poids,
        ]
      )
    ) as PoidsGroupeMesure;

    const toutesVraisemblance = configurationPourNiveauSecurite.formules.map(
      (f) => f({ ...groupes, ...poids })
    );

    const maxCalcule = Math.max(...toutesVraisemblance);
    const maxBorne = Math.min(maxCalcule, 4);

    return maxBorne as Vraisemblance;
  }
}
