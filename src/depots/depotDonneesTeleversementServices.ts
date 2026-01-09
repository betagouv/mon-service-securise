import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { LigneServiceTeleverseV2 } from '../modeles/televersement/serviceTeleverseV2.js';
import { DepotDonneesTeleversementServices } from './depotDonneesTeleversementServices.interface.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import TeleversementServicesV2 from '../modeles/televersement/televersementServicesV2.js';

export type PersistanceTeleversementServices = {
  ajouteTeleversementServices: (
    idUtilisateur: UUID,
    donneesChiffrees: DonneesChiffrees
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
  referentielV2: ReferentielV2;
};

const creeDepot = (
  config: Configuration
): DepotDonneesTeleversementServices => {
  const {
    adaptateurPersistance: persistance,
    adaptateurChiffrement: chiffrement,
    referentielV2,
  } = config;

  const nouveauTeleversementServices = async (
    idUtilisateur: UUID,
    donneesTeleversementServices: LigneServiceTeleverseV2[]
  ) => {
    const donneesChiffrees = await chiffrement.chiffre(
      donneesTeleversementServices
    );
    return persistance.ajouteTeleversementServices(
      idUtilisateur,
      donneesChiffrees
    );
  };

  const lisTeleversementServices = async (idUtilisateur: UUID) => {
    const persistees =
      await persistance.lisTeleversementServices(idUtilisateur);
    if (!persistees) return undefined;

    const { donnees } = persistees;
    const services = await chiffrement.dechiffre(donnees.services);

    const lignes = (services as LigneServiceTeleverseV2[]).map((s) => ({
      ...s,
      dateHomologation: s.dateHomologation
        ? new Date(s.dateHomologation)
        : undefined,
    }));
    return new TeleversementServicesV2({ services: lignes }, referentielV2);
  };

  const lisPourcentageProgressionTeleversementServices = async (
    idUtilisateur: UUID
  ) => {
    const televersement = await lisTeleversementServices(idUtilisateur);
    if (!televersement) return undefined;

    const { progression } =
      await persistance.lisProgressionTeleversementServices(idUtilisateur);

    return Math.floor(((progression + 1) / televersement.nombre()) * 100);
  };

  const supprimeTeleversementServices = async (idUtilisateur: UUID) =>
    persistance.supprimeTeleversementServices(idUtilisateur);

  const metsAJourProgressionTeleversement = async (
    idUtilisateur: UUID,
    progression: number
  ) =>
    persistance.metsAJourProgressionTeleversement(idUtilisateur, progression);

  return {
    lisPourcentageProgressionTeleversementServices,
    lisTeleversementServices,
    metsAJourProgressionTeleversement,
    nouveauTeleversementServices,
    supprimeTeleversementServices,
  };
};

export { creeDepot };
