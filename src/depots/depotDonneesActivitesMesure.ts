import ActiviteMesure, {
  IdMesure,
  TypeActiviteMesure,
} from '../modeles/activiteMesure.js';
import { UUID } from '../typesBasiques.js';

export type PersistanceActiviteMesure = {
  ajouteActiviteMesure: (
    idActeur: UUID,
    idService: UUID,
    idMesure: IdMesure,
    type: TypeActiviteMesure,
    typeMesure: 'generale' | 'specifique',
    details: Record<string, unknown>
  ) => Promise<void>;
  activitesMesure: (
    idService: UUID,
    idMesure: IdMesure
  ) => Promise<ActiviteMesure[]>;
};

const creeDepot = (config: {
  adaptateurPersistance: PersistanceActiviteMesure;
}) => {
  const { adaptateurPersistance } = config;

  const ajouteActiviteMesure = (activite: ActiviteMesure) =>
    adaptateurPersistance.ajouteActiviteMesure(
      activite.idActeur,
      activite.idService,
      activite.idMesure,
      activite.type,
      activite.typeMesure,
      activite.details
    );

  const lisActivitesMesure = async (idService: UUID, idMesure: IdMesure) => {
    const activitesMesure = await adaptateurPersistance.activitesMesure(
      idService,
      idMesure
    );
    return activitesMesure
      .map((a) => ({ ...a, date: new Date(a.date!) }))
      .sort((a, b) => +b.date - +a.date);
  };

  return {
    ajouteActiviteMesure,
    lisActivitesMesure,
  };
};
export { creeDepot };
