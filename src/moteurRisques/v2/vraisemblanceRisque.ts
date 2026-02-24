/* eslint-disable no-empty-function */
import {
  ConfigurationPourNiveau,
  ConfigurationVraisemblancePourUnVecteur,
  IdentifiantGroupeMesureVraisemblance,
  MesureAvecStatut,
  PoidsGroupeMesure,
  Vraisemblance,
} from './vraisemblance/vraisemblance.types.js';
import type {
  IdMesureV2,
  NiveauSecurite,
} from '../../../donneesReferentielMesuresV2.js';

export class VraisemblanceRisque {
  constructor(
    private readonly configuration: ConfigurationVraisemblancePourUnVecteur
  ) {}

  calculePourService(
    niveauSecurite: NiveauSecurite,
    mesuresPersonnalisees: Record<IdMesureV2, MesureAvecStatut>
  ): Vraisemblance {
    const configurationPourNiveauSecurite = this.configuration[
      niveauSecurite
    ] as ConfigurationPourNiveau;

    const groupes = Object.fromEntries(
      Object.entries(configurationPourNiveauSecurite.groupes).map(
        ([cleGroupe, groupe]) => [
          cleGroupe,
          groupe.idsMesures.map(
            (id) => mesuresPersonnalisees[id] || { statut: '' }
          ),
        ]
      )
    ) as Record<IdentifiantGroupeMesureVraisemblance, MesureAvecStatut[]>;

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
