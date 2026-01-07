import ParcoursUtilisateur, {
  DonneesParcoursUtilisateur,
} from '../modeles/parcoursUtilisateur.js';
import EvenementNouvelleConnexionUtilisateur from '../bus/evenementNouvelleConnexionUtilisateur.js';
import { Referentiel } from '../referentiel.interface.js';
import BusEvenements from '../bus/busEvenements.js';
import { UUID } from '../typesBasiques.js';
import { VersionService } from '../modeles/versionService.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

export type PersistanceParcoursUtilisateur = {
  lisParcoursUtilisateur: (
    idUtilisateur: UUID
  ) => Promise<DonneesParcoursUtilisateur>;
  versionsServiceUtiliseesParUtilisateur: (
    idUtilisateur: UUID
  ) => Promise<VersionService[]>;
  sauvegardeParcoursUtilisateur: (
    idUtilisateur: UUID,
    donnees: DonneesParcoursUtilisateur
  ) => Promise<void>;
};

const creeDepot = (config: {
  adaptateurPersistance: PersistanceParcoursUtilisateur;
  referentiel: Referentiel;
  busEvenements: BusEvenements;
}) => {
  const { adaptateurPersistance, referentiel, busEvenements } = config;

  const lisParcoursUtilisateur = async (idUtilisateur: UUID) => {
    const parcoursConnu =
      await adaptateurPersistance.lisParcoursUtilisateur(idUtilisateur);
    const versionsService =
      await adaptateurPersistance.versionsServiceUtiliseesParUtilisateur(
        idUtilisateur
      );
    return parcoursConnu
      ? new ParcoursUtilisateur(
          { ...parcoursConnu, versionsService },
          referentiel
        )
      : ParcoursUtilisateur.pourUtilisateur(
          idUtilisateur,
          referentiel,
          versionsService
        );
  };

  const sauvegardeParcoursUtilisateur = async (
    parcoursUtilisateur: ParcoursUtilisateur
  ) => {
    await adaptateurPersistance.sauvegardeParcoursUtilisateur(
      parcoursUtilisateur.idUtilisateur,
      parcoursUtilisateur.donneesSerialisees()
    );
  };

  const enregistreNouvelleConnexionUtilisateur = async (
    idUtilisateur: UUID,
    source: SourceAuthentification
  ) => {
    const parcoursUtilisateur = await lisParcoursUtilisateur(idUtilisateur);

    parcoursUtilisateur.enregistreDerniereConnexionMaintenant();
    await sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    await busEvenements.publie(
      new EvenementNouvelleConnexionUtilisateur({
        idUtilisateur,
        dateDerniereConnexion:
          parcoursUtilisateur.dateDerniereConnexion as string,
        source,
      })
    );
  };

  const marqueTableauDeBordVuDansParcoursUtilisateur = async (
    idUtilisateur: UUID
  ) => {
    const parcoursUtilisateur = await lisParcoursUtilisateur(idUtilisateur);

    if (parcoursUtilisateur.aVuTableauDeBord()) {
      return;
    }

    parcoursUtilisateur.marqueTableauDeBordVu();
    await sauvegardeParcoursUtilisateur(parcoursUtilisateur);
  };

  return {
    lisParcoursUtilisateur,
    marqueTableauDeBordVuDansParcoursUtilisateur,
    sauvegardeParcoursUtilisateur,
    enregistreNouvelleConnexionUtilisateur,
  };
};

export type DepotDonneesParcoursUtilisateurs = ReturnType<typeof creeDepot>;

export { creeDepot };
