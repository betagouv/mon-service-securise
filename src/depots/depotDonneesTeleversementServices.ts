import TeleversementServices from '../modeles/televersement/televersementServices.js';
import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { VersionService } from '../modeles/versionService.js';
import { LigneServiceTeleverseV2 } from '../modeles/televersement/serviceTeleverseV2.js';
import { DepotDonneesTeleversementServices } from './depotDonneesTeleversementServices.interface.js';
import { Referentiel } from '../referentiel.interface.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';

export type PersistanceTeleversementServices = {
  ajouteTeleversementServices: (
    idUtilisateur: UUID,
    donneesChiffrees: DonneesChiffrees,
    versionService: VersionService
  ) => Promise<UUID>;
  lisTeleversementServices: (
    idUtilisateur: UUID
  ) => Promise<undefined | { donnees: { services: DonneesChiffrees } }>;
  lisProgressionTeleversementServices: (
    idUtilisateur: UUID
  ) => Promise<{ progression: number }>;
  supprimeTeleversementServices: (idUtilisateur: UUID) => Promise<void>;
  metsAJourProgressionTeleversement: (
    idUtilisateur: UUID,
    progression: number
  ) => Promise<void>;
};

type Configuration = {
  adaptateurChiffrement: AdaptateurChiffrement;
  adaptateurPersistance: PersistanceTeleversementServices;
  referentiel: Referentiel;
};

const creeDepot = (
  config: Configuration
): DepotDonneesTeleversementServices => {
  const { adaptateurPersistance, adaptateurChiffrement, referentiel } = config;

  const nouveauTeleversementServices = async (
    idUtilisateur: UUID,
    donneesTeleversementServices: LigneServiceTeleverseV2[],
    versionService: VersionService
  ) => {
    const donneesChiffrees = await adaptateurChiffrement.chiffre(
      donneesTeleversementServices
    );
    return adaptateurPersistance.ajouteTeleversementServices(
      idUtilisateur,
      donneesChiffrees,
      versionService
    );
  };

  const lisTeleversementServices = async (idUtilisateur: UUID) => {
    const donneesChiffrees =
      await adaptateurPersistance.lisTeleversementServices(idUtilisateur);
    if (!donneesChiffrees) return undefined;

    const services = await adaptateurChiffrement.dechiffre(
      donneesChiffrees.donnees.services
    );
    return new TeleversementServices({ services }, referentiel);
  };

  const lisPourcentageProgressionTeleversementServices = async (
    idUtilisateur: UUID
  ) => {
    const televersement = await lisTeleversementServices(idUtilisateur);
    if (!televersement) return undefined;

    const { progression } =
      await adaptateurPersistance.lisProgressionTeleversementServices(
        idUtilisateur
      );
    return Math.floor(((progression + 1) / televersement.nombre()) * 100);
  };

  const supprimeTeleversementServices = async (idUtilisateur: UUID) =>
    adaptateurPersistance.supprimeTeleversementServices(idUtilisateur);

  const metsAJourProgressionTeleversement = async (
    idUtilisateur: UUID,
    progression: number
  ) =>
    adaptateurPersistance.metsAJourProgressionTeleversement(
      idUtilisateur,
      progression
    );

  return {
    lisPourcentageProgressionTeleversementServices,
    lisTeleversementServices,
    metsAJourProgressionTeleversement,
    nouveauTeleversementServices,
    supprimeTeleversementServices,
  };
};
export { creeDepot };
