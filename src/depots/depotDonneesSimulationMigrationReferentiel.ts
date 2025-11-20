import Service from '../modeles/service.js';
import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import {
  BrouillonService,
  DonneesBrouillonService,
} from '../modeles/brouillonService.js';
import { convertisDescriptionV1BrouillonV2 } from '../modeles/convertisseurDescriptionV1BrouillonV2.js';
import DescriptionService from '../modeles/descriptionService.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { ErreurSimulationInexistante } from '../erreurs.js';

export type DepotDonneesSimulationMigrationReferentiel = {
  ajouteSimulationMigrationReferentielSiNecessaire: (
    service: Service
  ) => Promise<void>;
  lisSimulationMigrationReferentiel: (
    idService: UUID
  ) => Promise<BrouillonService>;
};

type PersistanceSimulationMigrationReferentiel = {
  sauvegardeSimulationMigrationReferentiel: (
    idService: UUID,
    donnees: DonneesChiffrees
  ) => Promise<void>;
  lisSimulationMigrationReferentiel: (
    idService: UUID
  ) => Promise<{ donnees: DonneesChiffrees }>;
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

  const lisSimulationMigrationReferentiel = async (idService: UUID) => {
    const donneesChiffrees =
      await persistance.lisSimulationMigrationReferentiel(idService);
    if (!donneesChiffrees) throw new ErreurSimulationInexistante();

    const donneesEnClair =
      await adaptateurChiffrement.dechiffre<DonneesBrouillonService>(
        donneesChiffrees.donnees
      );

    return new BrouillonService(idService, donneesEnClair);
  };

  return {
    ajouteSimulationMigrationReferentielSiNecessaire,
    lisSimulationMigrationReferentiel,
  };
};

export { creeDepot };
