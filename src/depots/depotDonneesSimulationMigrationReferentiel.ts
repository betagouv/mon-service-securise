import Service from '../modeles/service.js';
import { UUID } from '../typesBasiques.js';
import {
  BrouillonService,
  DonneesBrouillonService,
} from '../modeles/brouillonService.js';
import { convertisDescriptionV1BrouillonV2 } from '../modeles/convertisseurDescriptionV1BrouillonV2.js';
import DescriptionService from '../modeles/descriptionService.js';

export type DepotDonneesSimulationMigrationReferentiel = {
  ajouteSimulationMigrationReferentielSiNecessaire: (
    service: Service
  ) => Promise<void>;
};

type PersistanceSimulationMigrationReferentiel = {
  sauvegardeSimulationMigrationReferentiel: (
    idService: UUID,
    donnees: DonneesBrouillonService
  ) => Promise<void>;
  lisSimulationMigrationReferentiel: (
    idService: UUID
  ) => Promise<BrouillonService>;
};

const creeDepot = ({
  persistance,
}: {
  persistance: PersistanceSimulationMigrationReferentiel;
}): DepotDonneesSimulationMigrationReferentiel => {
  const ajouteSimulationMigrationReferentielSiNecessaire = async (
    service: Service
  ) => {
    const existante = await persistance.lisSimulationMigrationReferentiel(
      service.id
    );
    if (existante) return;

    const projection = convertisDescriptionV1BrouillonV2(
      service.descriptionService as DescriptionService
    );

    await persistance.sauvegardeSimulationMigrationReferentiel(
      service.id,
      projection.donneesAPersister()
    );
  };

  return {
    ajouteSimulationMigrationReferentielSiNecessaire,
  };
};

export { creeDepot };
