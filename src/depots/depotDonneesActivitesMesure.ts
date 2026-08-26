import ActiviteMesure, {
  DonneesActiviteMesure,
  DonneesCreationActiviteMesure,
  IdMesure,
  TypeActiviteMesure,
} from '../modeles/activiteMesure.js';
import { UUID } from '../typesBasiques.js';
import { SimulationMigrationReferentiel } from '../moteurRegles/simulationMigration/simulationMigrationReferentiel.js';
import BusEvenements from '../bus/busEvenements.js';
import { EvenementActiviteMesureAjoutee } from '../bus/evenementActiviteMesureAjoutee.js';

export type PersistanceActiviteMesure = {
  ajouteActiviteMesure: (
    idActeur: UUID,
    idService: UUID,
    idMesure: IdMesure,
    type: TypeActiviteMesure,
    typeMesure: 'generale' | 'specifique',
    details: Record<string, unknown>,
    date: Date
  ) => Promise<void>;
  ajouteActivitesMesure: (activitesMesure: ActiviteMesure[]) => Promise<void>;
  activitesMesure: (
    idService: UUID,
    idMesure: IdMesure
  ) => Promise<DonneesActiviteMesure[]>;
  lisToutesActivitesMesures: (
    idService: UUID
  ) => Promise<DonneesActiviteMesure[]>;
  supprimeToutesActivitesMesure: (idService: UUID) => Promise<void>;
};

const creeDepot = (config: {
  adaptateurPersistance: PersistanceActiviteMesure;
  busEvenements: BusEvenements;
}) => {
  const { adaptateurPersistance, busEvenements } = config;

  const ajouteActiviteMesure = async (
    activite: DonneesCreationActiviteMesure
  ) => {
    const date = new Date();
    await adaptateurPersistance.ajouteActiviteMesure(
      activite.idActeur,
      activite.idService,
      activite.idMesure,
      activite.type,
      activite.typeMesure,
      activite.details,
      date
    );

    await busEvenements.publie(
      new EvenementActiviteMesureAjoutee(
        new ActiviteMesure({
          ...activite,
          date,
        })
      )
    );
  };

  const lisActivitesMesure = async (idService: UUID, idMesure: IdMesure) => {
    const activitesMesure = await adaptateurPersistance.activitesMesure(
      idService,
      idMesure
    );
    return activitesMesure
      .map((a) => new ActiviteMesure({ ...a, date: new Date(a.date) }))
      .sort((a, b) => +b.date - +a.date);
  };

  const migreActivitesMesuresVersV2 = async (
    simulation: SimulationMigrationReferentiel
  ) => {
    const idService = simulation.idService();

    const activitesExistantes =
      await adaptateurPersistance.lisToutesActivitesMesures(idService);
    const activitesMigrees = simulation.activitesMesures(activitesExistantes);

    await adaptateurPersistance.supprimeToutesActivitesMesure(idService);
    await adaptateurPersistance.ajouteActivitesMesure(activitesMigrees);
  };

  return {
    ajouteActiviteMesure,
    lisActivitesMesure,
    migreActivitesMesuresVersV2,
  };
};

export type DepotDonneesActivitesMesure = ReturnType<typeof creeDepot>;

export { creeDepot };
