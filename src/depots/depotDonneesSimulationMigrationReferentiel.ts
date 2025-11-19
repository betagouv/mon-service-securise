import Service from '../modeles/service.js';
import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { BrouillonService } from '../modeles/brouillonService.js';
import { convertisDescriptionV1BrouillonV2 } from '../modeles/convertisseurDescriptionV1BrouillonV2.js';
import DescriptionService from '../modeles/descriptionService.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';

export type DepotDonneesSimulationMigrationReferentiel = {
  ajouteSimulationMigrationReferentielSiNecessaire: (
    service: Service
  ) => Promise<void>;
};

type PersistanceSimulationMigrationReferentiel = {
  sauvegardeSimulationMigrationReferentiel: (
    idService: UUID,
    donnees: DonneesChiffrees
  ) => Promise<void>;
  lisSimulationMigrationReferentiel: (
    idService: UUID
  ) => Promise<BrouillonService>;
};

const creeDepot = ({
  persistance,
  adaptateurChiffrement,
}: {
  persistance: PersistanceSimulationMigrationReferentiel;
  adaptateurChiffrement: AdaptateurChiffrement;
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

    const donneesEnClair = projection.donneesAPersister();
    const donneesChiffrees =
      await adaptateurChiffrement.chiffre(donneesEnClair);
    await persistance.sauvegardeSimulationMigrationReferentiel(
      service.id,
      donneesChiffrees
    );
  };

  return {
    ajouteSimulationMigrationReferentielSiNecessaire,
  };
};

export { creeDepot };
