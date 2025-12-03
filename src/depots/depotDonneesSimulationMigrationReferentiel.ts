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
import type BusEvenements from '../bus/busEvenements.js';
import EvenementSimulationMigrationReferentielCreee from '../bus/evenementSimulationMigrationReferentielCreee.js';

export type DepotDonneesSimulationMigrationReferentiel = {
  sauvegardeSimulationMigrationReferentiel: (
    idService: UUID,
    donnees: BrouillonService
  ) => Promise<void>;
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
  busEvenements,
}: {
  persistance: PersistanceSimulationMigrationReferentiel;
  adaptateurChiffrement: AdaptateurChiffrement;
  busEvenements: BusEvenements;
}): DepotDonneesSimulationMigrationReferentiel => {
  const sauvegardeSimulationMigrationReferentiel = async (
    idService: UUID,
    simulation: BrouillonService
  ) => {
    const donneesEnClair = simulation.donneesAPersister();
    const donneesChiffrees =
      await adaptateurChiffrement.chiffre(donneesEnClair);
    await persistance.sauvegardeSimulationMigrationReferentiel(
      idService,
      donneesChiffrees
    );
  };

  const ajouteSimulationMigrationReferentielSiNecessaire = async (
    service: Service
  ) => {
    const existante = await persistance.lisSimulationMigrationReferentiel(
      service.id
    );
    if (existante) return;

    const simulation = convertisDescriptionV1BrouillonV2(
      service.descriptionService as DescriptionService
    );

    await sauvegardeSimulationMigrationReferentiel(service.id, simulation);
    busEvenements.publie(
      new EvenementSimulationMigrationReferentielCreee({ service })
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
    sauvegardeSimulationMigrationReferentiel,
    ajouteSimulationMigrationReferentielSiNecessaire,
    lisSimulationMigrationReferentiel,
  };
};

export { creeDepot };
